package org.cardanofoundation.reeve.indexer.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.cardanofoundation.reeve.indexer.model.domain.event.GrantEventType;
import org.cardanofoundation.reeve.indexer.model.entity.EventAllocationEntity;
import org.cardanofoundation.reeve.indexer.model.entity.EventEntity;
import org.cardanofoundation.reeve.indexer.model.entity.EventMilestoneEntity;
import org.cardanofoundation.reeve.indexer.model.view.audit.AuditEventLineView;
import org.cardanofoundation.reeve.indexer.model.view.audit.AuditSummaryView;
import org.cardanofoundation.reeve.indexer.model.view.audit.MilestoneAuditView;
import org.cardanofoundation.reeve.indexer.model.view.audit.ProjectAuditView;
import org.cardanofoundation.reeve.indexer.model.view.audit.SubProjectAuditView;

/**
 * Folds an organisation's FUNDING/SPENDING/REFUND events into an {@link AuditSummaryView}. Only the
 * three grant-lifecycle types contribute to the roll-up; organisation-defined custom events are
 * ignored. Spend is attributed to a project best-effort: first via the SPENDING event's own
 * allocation, then via its {@code fundingId} when that funding maps to a single project, otherwise
 * to a synthetic "unattributed" bucket so per-project spend reconciles with the overall total.
 */
final class AuditSummaryAssembler {

    private static final String UNATTRIBUTED_KEY = "unattributed";
    private static final String UNATTRIBUTED_TITLE = "Unattributed";

    private AuditSummaryAssembler() {
    }

    static AuditSummaryView assemble(String organisationId, String organisationName,
            List<EventEntity> events, LocalDate dateFrom, LocalDate dateTo,
            java.util.Set<String> projectIds) {

        boolean projectFilter = projectIds != null && !projectIds.isEmpty();

        List<EventEntity> included = events.stream()
                .filter(e -> withinRange(e.getDate(), dateFrom, dateTo))
                .filter(e -> !projectFilter || touchesProject(e, projectIds))
                .toList();

        BigDecimal totalFunded = BigDecimal.ZERO;
        BigDecimal totalSpent = BigDecimal.ZERO;
        BigDecimal totalRefunded = BigDecimal.ZERO;
        int fundingCount = 0;
        int spendingCount = 0;
        int refundCount = 0;
        LocalDate firstDate = null;
        LocalDate lastDate = null;
        LocalDate lastPublishedDate = null;

        Map<String, Integer> currencyTally = new HashMap<>();
        Map<String, ProjectAgg> projects = new LinkedHashMap<>();
        // fundingId -> distinct project keys declared by FUNDING events for that funding round.
        Map<String, java.util.Set<String>> fundingProjects = new HashMap<>();
        List<EventEntity> spendingEvents = new ArrayList<>();
        List<EventEntity> refundEvents = new ArrayList<>();
        List<AuditEventLineView> eventLines = new ArrayList<>();

        // Pass 1: totals, funding allocations and the fundingId -> project index.
        for (EventEntity e : included) {
            GrantEventType type = grantType(e.getEventType());
            if (type == null) {
                continue;
            }
            tallyCurrency(currencyTally, e);
            if (e.getDate() != null) {
                firstDate = (firstDate == null || e.getDate().isBefore(firstDate)) ? e.getDate() : firstDate;
                lastDate = (lastDate == null || e.getDate().isAfter(lastDate)) ? e.getDate() : lastDate;
            }
            LocalDate publishedDate = parsePublishedDate(e.getEventTimestamp());
            if (publishedDate != null) {
                lastPublishedDate = (lastPublishedDate == null || publishedDate.isAfter(lastPublishedDate)) ? publishedDate : lastPublishedDate;
            }
            BigDecimal amount = nz(e.getTotalAmount());
            switch (type) {
                case FUNDING -> {
                    fundingCount++;
                    totalFunded = totalFunded.add(amount);
                    indexFunding(e, projects, fundingProjects, projectIds);
                    eventLines.add(baseLine(e).build());
                }
                case SPENDING -> {
                    spendingCount++;
                    totalSpent = totalSpent.add(amount);
                    spendingEvents.add(e);
                }
                case REFUND -> {
                    refundCount++;
                    totalRefunded = totalRefunded.add(amount);
                    refundEvents.add(e);
                }
            }
        }

        // Pass 2: attribute spend and refunds now that every funding round's projects are known. Each
        // contributes its (attributed) ledger row to eventLines.
        for (EventEntity s : spendingEvents) {
            attributeSpend(s, projects, fundingProjects, eventLines, projectIds);
        }
        for (EventEntity r : refundEvents) {
            attributeRefund(r, projects, fundingProjects, eventLines, projectIds);
        }

        eventLines.sort(Comparator.comparing(AuditEventLineView::getDate,
                Comparator.nullsLast(Comparator.reverseOrder())));

        BigDecimal netRemaining = totalFunded.subtract(totalSpent).subtract(totalRefunded);

        List<ProjectAuditView> projectViews = projects.values().stream()
                .sorted(Comparator.comparing((ProjectAgg p) -> p.unattributed)
                        .thenComparing(p -> p.allocated, Comparator.reverseOrder())
                        .thenComparing(p -> p.spent, Comparator.reverseOrder()))
                .map(AuditSummaryAssembler::toProjectView)
                .toList();

        return AuditSummaryView.builder()
                .organisationId(organisationId)
                .organisationName(organisationName)
                .currency(dominantCurrency(currencyTally))
                .totalFunded(totalFunded)
                .totalSpent(totalSpent)
                .totalRefunded(totalRefunded)
                .netRemaining(netRemaining)
                .fundingCount(fundingCount)
                .spendingCount(spendingCount)
                .refundCount(refundCount)
                .firstEventDate(firstDate)
                .lastEventDate(lastPublishedDate)
                .projects(projectViews)
                .events(eventLines)
                .build();
    }

    private static AuditEventLineView.AuditEventLineViewBuilder baseLine(EventEntity e) {
        return AuditEventLineView.builder()
                .eventId(e.getEventId())
                .txHash(e.getTxHash())
                .fundingTx(e.getFundingTx())
                .eventType(e.getEventType())
                .eventCategory(e.getEventCategory())
                .date(e.getDate())
                .amount(nz(e.getTotalAmount()))
                .currency(isPresent(e.getCurrencyCustCode()) ? e.getCurrencyCustCode() : e.getCurrencyId())
                .fundingId(e.getFundingId())
                .fundingEntity(e.getFundingEntity());
    }

    private static void indexFunding(EventEntity funding, Map<String, ProjectAgg> projects,
            Map<String, java.util.Set<String>> fundingProjects, java.util.Set<String> projectIds) {
        for (EventAllocationEntity alloc : funding.getAllocations()) {
            // With a project filter active, a multi-project funding round only contributes its
            // selected allocations, so non-selected projects don't leak into the roll-up.
            if (!isSelected(alloc, projectIds)) {
                continue;
            }
            String key = projectKey(alloc.getProjectId(), alloc.getProjectTitle());
            ProjectAgg pa = projects.computeIfAbsent(key,
                    k -> new ProjectAgg(k, alloc.getProjectId(), alloc.getProjectTitle()));
            pa.applyTitle(alloc.getProjectTitle());
            tallyCurrency(pa.currencyTally, funding);

            boolean hasSubProject = isPresent(alloc.getSubProjectId()) || isPresent(alloc.getSubProjectTitle());
            SubProjectAgg sp = hasSubProject ? pa.subProject(alloc.getSubProjectId(), alloc.getSubProjectTitle()) : null;

            for (EventMilestoneEntity ms : alloc.getMilestones()) {
                BigDecimal amt = nz(ms.getAllocatedAmount());
                pa.allocated = pa.allocated.add(amt);
                MilestoneAgg ma;
                if (sp != null) {
                    ma = sp.milestone(ms.getMilestoneId(), ms.getMilestoneTitle());
                    sp.allocated = sp.allocated.add(amt);
                } else {
                    ma = pa.milestone(ms.getMilestoneId(), ms.getMilestoneTitle());
                }
                ma.allocated = ma.allocated.add(amt);
            }

            if (isPresent(funding.getFundingId())) {
                fundingProjects.computeIfAbsent(funding.getFundingId(), k -> new java.util.LinkedHashSet<>())
                        .add(key);
            }
        }
    }

    private static void attributeSpend(EventEntity s, Map<String, ProjectAgg> projects,
            Map<String, java.util.Set<String>> fundingProjects, List<AuditEventLineView> eventLines,
            java.util.Set<String> projectIds) {
        BigDecimal totalAmount = nz(s.getTotalAmount());

        // Step 1: the spend's own allocations name the projects (and sub-projects/milestones) it was
        // booked against. A spend can be split across several projects in a single event — each
        // allocation contributes only its own milestone-summed share, mirroring indexFunding's
        // per-allocation walk. One ledger line is emitted per allocation so "spending under project"
        // totals reconcile per project too.
        List<EventAllocationEntity> ownAllocations = selectedAllocations(s, projectIds);
        if (!ownAllocations.isEmpty()) {
            // A lone allocation with no milestone breakdown just names the project — the event's
            // whole amount belongs to it (older/simpler payloads never itemised the spend). Once an
            // event names more than one project, only its milestones can say how much went where.
            boolean singleAllocation = ownAllocations.size() == 1;
            for (EventAllocationEntity own : ownAllocations) {
                String key = projectKey(own.getProjectId(), own.getProjectTitle());
                ProjectAgg pa = projects.computeIfAbsent(key,
                        k -> new ProjectAgg(k, own.getProjectId(), own.getProjectTitle()));
                pa.applyTitle(own.getProjectTitle());
                tallyCurrency(pa.currencyTally, s);

                boolean hasSubProject = isPresent(own.getSubProjectId()) || isPresent(own.getSubProjectTitle());
                SubProjectAgg sp = hasSubProject ? pa.subProject(own.getSubProjectId(), own.getSubProjectTitle()) : null;

                BigDecimal allocAmount = BigDecimal.ZERO;
                for (EventMilestoneEntity ms : own.getMilestones()) {
                    BigDecimal amt = nz(ms.getAllocatedAmount());
                    allocAmount = allocAmount.add(amt);
                    MilestoneAgg ma;
                    if (sp != null) {
                        ma = sp.milestone(ms.getMilestoneId(), ms.getMilestoneTitle());
                        sp.spent = sp.spent.add(amt);
                    } else {
                        ma = pa.milestone(ms.getMilestoneId(), ms.getMilestoneTitle());
                    }
                    ma.spent = ma.spent.add(amt);
                }
                if (own.getMilestones().isEmpty() && singleAllocation) {
                    allocAmount = totalAmount;
                }
                pa.spent = pa.spent.add(allocAmount);

                eventLines.add(baseLine(s)
                        .amount(allocAmount)
                        .vendor(s.getVendor())
                        .spendingCategory(s.getSpendingCategory())
                        .projectKey(pa.key)
                        .projectId(pa.projectId)
                        .projectTitle(pa.title)
                        .build());
            }
        } else if (isPresent(s.getFundingId()) && singleFundingProject(fundingProjects, s.getFundingId()) != null) {
            // Step 2: fall back to the referenced funding when it maps to exactly one project.
            ProjectAgg pa = projects.get(singleFundingProject(fundingProjects, s.getFundingId()));
            pa.spent = pa.spent.add(totalAmount);
            tallyCurrency(pa.currencyTally, s);

            eventLines.add(baseLine(s)
                    .amount(totalAmount)
                    .vendor(s.getVendor())
                    .spendingCategory(s.getSpendingCategory())
                    .projectKey(pa.key)
                    .projectId(pa.projectId)
                    .projectTitle(pa.title)
                    .build());
        } else {
            // Step 3: unattributed — still counted so per-project spend reconciles with totalSpent.
            ProjectAgg pa = projects.computeIfAbsent(UNATTRIBUTED_KEY, k -> ProjectAgg.unattributed());
            pa.spent = pa.spent.add(totalAmount);
            tallyCurrency(pa.currencyTally, s);

            eventLines.add(baseLine(s)
                    .amount(totalAmount)
                    .vendor(s.getVendor())
                    .spendingCategory(s.getSpendingCategory())
                    .projectKey(pa.key)
                    .build());
        }
    }

    private static void attributeRefund(EventEntity r, Map<String, ProjectAgg> projects,
            Map<String, java.util.Set<String>> fundingProjects, List<AuditEventLineView> eventLines,
            java.util.Set<String> projectIds) {
        BigDecimal totalAmount = nz(r.getTotalAmount());

        // Step 1: the refund's own allocations name the projects (and sub-projects/milestones) it was
        // booked against, same per-allocation walk as attributeSpend.
        List<EventAllocationEntity> ownAllocations = selectedAllocations(r, projectIds);
        if (!ownAllocations.isEmpty()) {
            boolean singleAllocation = ownAllocations.size() == 1;
            for (EventAllocationEntity own : ownAllocations) {
                String key = projectKey(own.getProjectId(), own.getProjectTitle());
                ProjectAgg pa = projects.computeIfAbsent(key,
                        k -> new ProjectAgg(k, own.getProjectId(), own.getProjectTitle()));
                pa.applyTitle(own.getProjectTitle());
                tallyCurrency(pa.currencyTally, r);

                boolean hasSubProject = isPresent(own.getSubProjectId()) || isPresent(own.getSubProjectTitle());
                SubProjectAgg sp = hasSubProject ? pa.subProject(own.getSubProjectId(), own.getSubProjectTitle()) : null;

                BigDecimal allocAmount = BigDecimal.ZERO;
                for (EventMilestoneEntity ms : own.getMilestones()) {
                    BigDecimal amt = nz(ms.getAllocatedAmount());
                    allocAmount = allocAmount.add(amt);
                    MilestoneAgg ma;
                    if (sp != null) {
                        ma = sp.milestone(ms.getMilestoneId(), ms.getMilestoneTitle());
                        sp.refunded = sp.refunded.add(amt);
                    } else {
                        ma = pa.milestone(ms.getMilestoneId(), ms.getMilestoneTitle());
                    }
                    ma.refunded = ma.refunded.add(amt);
                }
                if (own.getMilestones().isEmpty() && singleAllocation) {
                    allocAmount = totalAmount;
                }
                pa.refunded = pa.refunded.add(allocAmount);

                eventLines.add(baseLine(r)
                        .amount(allocAmount)
                        .projectKey(pa.key)
                        .projectId(pa.projectId)
                        .projectTitle(pa.title)
                        .build());
            }
        } else if (isPresent(r.getFundingId()) && singleFundingProject(fundingProjects, r.getFundingId()) != null) {
            // Step 2: fall back to the referenced funding when it maps to exactly one project.
            ProjectAgg pa = projects.get(singleFundingProject(fundingProjects, r.getFundingId()));
            pa.refunded = pa.refunded.add(totalAmount);
            tallyCurrency(pa.currencyTally, r);

            eventLines.add(baseLine(r)
                    .amount(totalAmount)
                    .projectKey(pa.key)
                    .projectId(pa.projectId)
                    .projectTitle(pa.title)
                    .build());
        } else {
            // Step 3: unattributed, still counted so per-project refunds reconcile with totalRefunded.
            ProjectAgg pa = projects.computeIfAbsent(UNATTRIBUTED_KEY, k -> ProjectAgg.unattributed());
            pa.refunded = pa.refunded.add(totalAmount);
            tallyCurrency(pa.currencyTally, r);

            eventLines.add(baseLine(r)
                    .amount(totalAmount)
                    .projectKey(pa.key)
                    .build());
        }
    }

    /** The single project key a funding round maps to, or null if it funds zero or many projects. */
    private static String singleFundingProject(Map<String, java.util.Set<String>> fundingProjects,
            String fundingId) {
        java.util.Set<String> keys = fundingProjects.get(fundingId);
        return keys != null && keys.size() == 1 ? keys.iterator().next() : null;
    }

    private static ProjectAuditView toProjectView(ProjectAgg p) {
        List<SubProjectAuditView> subProjects = p.subProjects.values().stream()
                .map(sp -> {
                    BigDecimal netAllocated = sp.allocated.subtract(sp.refunded);
                    return SubProjectAuditView.builder()
                            .subProjectId(sp.subProjectId)
                            .subProjectTitle(sp.title)
                            .allocatedAmount(netAllocated)
                            .refundedAmount(sp.refunded)
                            .spentAmount(sp.spent)
                            .milestones(toMilestoneViews(sp.milestones))
                            .build();
                })
                .toList();
        BigDecimal netAllocated = p.allocated.subtract(p.refunded);
        return ProjectAuditView.builder()
                .projectKey(p.key)
                .projectId(p.projectId)
                .projectTitle(p.title)
                .currency(dominantCurrency(p.currencyTally))
                .allocatedAmount(netAllocated)
                .refundedAmount(p.refunded)
                .spentAmount(p.spent)
                .remaining(netAllocated.subtract(p.spent))
                .milestones(toMilestoneViews(p.milestones))
                .subProjects(subProjects)
                .build();
    }

    private static List<MilestoneAuditView> toMilestoneViews(Map<String, MilestoneAgg> milestones) {
        return milestones.values().stream()
                .map(m -> MilestoneAuditView.builder()
                        .milestoneId(m.milestoneId)
                        .milestoneTitle(m.title)
                        .allocatedAmount(m.allocated.subtract(m.refunded))
                        .refundedAmount(m.refunded)
                        .spentAmount(m.spent)
                        .build())
                .toList();
    }

    private static void tallyCurrency(Map<String, Integer> tally, EventEntity e) {
        String code = isPresent(e.getCurrencyCustCode()) ? e.getCurrencyCustCode()
                : (isPresent(e.getCurrencyId()) ? e.getCurrencyId() : null);
        if (code != null) {
            tally.merge(code, 1, Integer::sum);
        }
    }

    /** The calendar date an event was published on-chain, read from its metadata timestamp. */
    private static LocalDate parsePublishedDate(String eventTimestamp) {
        if (!isPresent(eventTimestamp) || eventTimestamp.length() < 10) {
            return null;
        }
        try {
            return LocalDate.parse(eventTimestamp.substring(0, 10));
        } catch (DateTimeParseException ex) {
            return null;
        }
    }

    private static String dominantCurrency(Map<String, Integer> tally) {
        return tally.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);
    }

    /**
     * All of an event's allocations whose project is selected when a project filter is active,
     * otherwise every allocation. Empty when the event has none (or none are selected).
     */
    private static List<EventAllocationEntity> selectedAllocations(EventEntity e, java.util.Set<String> projectIds) {
        if (e.getAllocations() == null || e.getAllocations().isEmpty()) {
            return List.of();
        }
        if (projectIds == null || projectIds.isEmpty()) {
            return e.getAllocations();
        }
        return e.getAllocations().stream()
                .filter(a -> isSelected(a, projectIds))
                .toList();
    }

    /** Whether an allocation's project is in the selected set (or no filter is active). */
    private static boolean isSelected(EventAllocationEntity alloc, java.util.Set<String> projectIds) {
        return projectIds == null || projectIds.isEmpty()
                || (alloc.getProjectId() != null && projectIds.contains(alloc.getProjectId()));
    }

    /** Whether any of an event's allocations references a selected project. */
    private static boolean touchesProject(EventEntity e, java.util.Set<String> projectIds) {
        if (e.getAllocations() == null) {
            return false;
        }
        return e.getAllocations().stream()
                .anyMatch(a -> a.getProjectId() != null && projectIds.contains(a.getProjectId()));
    }

    private static boolean withinRange(LocalDate date, LocalDate from, LocalDate to) {
        if (date == null) {
            return true; // events whose source omitted a date can't be period-filtered — always kept.
        }
        if (from != null && date.isBefore(from)) {
            return false;
        }
        return to == null || !date.isAfter(to);
    }

    private static GrantEventType grantType(String type) {
        return GrantEventType.isGrantType(type) ? GrantEventType.valueOf(type) : null;
    }

    private static String projectKey(String projectId, String projectTitle) {
        if (isPresent(projectId)) {
            return "id:" + projectId;
        }
        if (isPresent(projectTitle)) {
            return "title:" + projectTitle;
        }
        return "unknown";
    }

    private static boolean isPresent(String value) {
        return value != null && !value.isBlank();
    }

    private static BigDecimal nz(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    /** Mutable per-project accumulator used only while folding. */
    private static final class ProjectAgg {
        private final String key;
        private final String projectId;
        private String title;
        private final boolean unattributed;
        private BigDecimal allocated = BigDecimal.ZERO;
        private BigDecimal spent = BigDecimal.ZERO;
        private BigDecimal refunded = BigDecimal.ZERO;
        private final Map<String, MilestoneAgg> milestones = new LinkedHashMap<>();
        private final Map<String, SubProjectAgg> subProjects = new LinkedHashMap<>();
        private final Map<String, Integer> currencyTally = new HashMap<>();

        private ProjectAgg(String key, String projectId, String title) {
            this(key, projectId, title, false);
        }

        private ProjectAgg(String key, String projectId, String title, boolean unattributed) {
            this.key = key;
            this.projectId = projectId;
            this.title = title;
            this.unattributed = unattributed;
        }

        private static ProjectAgg unattributed() {
            return new ProjectAgg(UNATTRIBUTED_KEY, null, UNATTRIBUTED_TITLE, true);
        }

        private void applyTitle(String candidate) {
            if (title == null && candidate != null) {
                title = candidate;
            }
        }

        private SubProjectAgg subProject(String subProjectId, String subProjectTitle) {
            String key = isPresent(subProjectId) ? "id:" + subProjectId : (isPresent(subProjectTitle) ? "title:" + subProjectTitle : "unknown");
            return subProjects.computeIfAbsent(key, k -> new SubProjectAgg(subProjectId, subProjectTitle));
        }

        private MilestoneAgg milestone(String id, String title) {
            String key = isPresent(id) ? "id:" + id : (isPresent(title) ? "title:" + title : "unknown");
            return milestones.computeIfAbsent(key, k -> new MilestoneAgg(id, title));
        }
    }

    /** Mutable per-sub-project accumulator used only while folding. */
    private static final class SubProjectAgg {
        private final String subProjectId;
        private final String title;
        private BigDecimal allocated = BigDecimal.ZERO;
        private BigDecimal spent = BigDecimal.ZERO;
        private BigDecimal refunded = BigDecimal.ZERO;
        private final Map<String, MilestoneAgg> milestones = new LinkedHashMap<>();

        private SubProjectAgg(String subProjectId, String title) {
            this.subProjectId = subProjectId;
            this.title = title;
        }

        private MilestoneAgg milestone(String id, String title) {
            String key = isPresent(id) ? "id:" + id : (isPresent(title) ? "title:" + title : "unknown");
            return milestones.computeIfAbsent(key, k -> new MilestoneAgg(id, title));
        }
    }

    /** Mutable per-milestone accumulator used only while folding. */
    private static final class MilestoneAgg {
        private final String milestoneId;
        private final String title;
        private BigDecimal allocated = BigDecimal.ZERO;
        private BigDecimal spent = BigDecimal.ZERO;
        private BigDecimal refunded = BigDecimal.ZERO;

        private MilestoneAgg(String milestoneId, String title) {
            this.milestoneId = milestoneId;
            this.title = title;
        }
    }
}
