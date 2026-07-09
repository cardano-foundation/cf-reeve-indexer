package org.cardanofoundation.reeve.indexer.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;

import org.cardanofoundation.reeve.indexer.model.entity.EventAllocationEntity;
import org.cardanofoundation.reeve.indexer.model.entity.EventEntity;
import org.cardanofoundation.reeve.indexer.model.entity.EventMilestoneEntity;
import org.cardanofoundation.reeve.indexer.model.view.audit.AuditEventLineView;
import org.cardanofoundation.reeve.indexer.model.view.audit.AuditSummaryView;
import org.cardanofoundation.reeve.indexer.model.view.audit.ProjectAuditView;

class AuditSummaryAssemblerTest {

    private static EventMilestoneEntity milestone(String id, String title, String amount) {
        return EventMilestoneEntity.builder()
                .milestoneId(id)
                .milestoneTitle(title)
                .allocatedAmount(new BigDecimal(amount))
                .build();
    }

    private static EventAllocationEntity allocation(String projectId, String projectTitle,
            EventMilestoneEntity... milestones) {
        EventAllocationEntity allocation = EventAllocationEntity.builder()
                .projectId(projectId)
                .projectTitle(projectTitle)
                .build();
        for (EventMilestoneEntity milestone : milestones) {
            allocation.addMilestone(milestone);
        }
        return allocation;
    }

    private static EventEntity event(String type, String eventId, String fundingId, String currency,
            LocalDate date, String totalAmount, EventAllocationEntity... allocations) {
        EventEntity event = EventEntity.builder()
                .txHash("tx-" + eventId)
                .organisationId("org")
                .eventId(eventId)
                .eventType(type)
                .eventCategory("GRANT")
                .fundingId(fundingId)
                .currencyCustCode(currency)
                .date(date)
                .totalAmount(totalAmount == null ? null : new BigDecimal(totalAmount))
                .build();
        for (EventAllocationEntity allocation : allocations) {
            event.addAllocation(allocation);
        }
        return event;
    }

    private static ProjectAuditView project(AuditSummaryView summary, String projectId) {
        return summary.getProjects().stream()
                .filter(p -> projectId.equals(p.getProjectId()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("project not found: " + projectId));
    }

    @Test
    void aggregatesTotalsAttributesSpendAndReconciles() {
        List<EventEntity> events = List.of(
                // F1 funds two projects (PA:1000, PB:500). Funding events now carry a date too.
                event("FUNDING", "f1", "F1", "USD", LocalDate.parse("2026-01-01"), "1500",
                        allocation("PA", "Proj A", milestone("M1", "MS1", "1000")),
                        allocation("PB", "Proj B", milestone("M2", "MS2", "500"))),
                // F2 funds two projects — spends against it cannot be split, so they go unattributed.
                event("FUNDING", "f2", "F2", "USD", LocalDate.parse("2026-01-02"), "500",
                        allocation("PC", "Proj C", milestone("M3", "MS3", "300")),
                        allocation("PD", "Proj D", milestone("M4", "MS4", "200"))),
                // F3 funds a single project (PE:700) — spends referencing it resolve to PE.
                event("FUNDING", "f3", "F3", "USD", LocalDate.parse("2026-01-03"), "700",
                        allocation("PE", "Proj E", milestone("M5", "MS5", "700"))),
                // S1: own allocation names PA / M1 -> attributed precisely.
                event("SPENDING", "s1", "F1", "USD", LocalDate.parse("2026-01-10"), "400",
                        allocation("PA", "Proj A", milestone("M1", "MS1", "400"))),
                // S2: no allocation, fundingId F3 maps to a single project -> attributed to PE.
                event("SPENDING", "s2", "F3", "USD", LocalDate.parse("2026-01-20"), "250"),
                // S3: no allocation, fundingId F2 maps to two projects -> unattributed.
                event("SPENDING", "s3", "F2", "USD", LocalDate.parse("2026-01-25"), "150"),
                // Refund — also dated now.
                event("REFUND", "r1", "F1", "USD", LocalDate.parse("2026-01-30"), "100"));

        AuditSummaryView summary = AuditSummaryAssembler.assemble("org", "Org Ltd", events, null, null, null);

        assertEquals(0, new BigDecimal("2700").compareTo(summary.getTotalFunded()));
        assertEquals(0, new BigDecimal("800").compareTo(summary.getTotalSpent()));
        assertEquals(0, new BigDecimal("100").compareTo(summary.getTotalRefunded()));
        assertEquals(0, new BigDecimal("1800").compareTo(summary.getNetRemaining()));
        assertEquals("USD", summary.getCurrency());
        assertEquals(3, summary.getFundingCount());
        assertEquals(3, summary.getSpendingCount());
        assertEquals(1, summary.getRefundCount());

        // Precise attribution: PA allocated 1000, spent 400 (and its milestone too).
        ProjectAuditView pa = project(summary, "PA");
        assertEquals(0, new BigDecimal("1000").compareTo(pa.getAllocatedAmount()));
        assertEquals(0, new BigDecimal("400").compareTo(pa.getSpentAmount()));
        assertEquals(0, new BigDecimal("600").compareTo(pa.getRemaining()));
        assertEquals(0, new BigDecimal("400").compareTo(pa.getMilestones().get(0).getSpentAmount()));

        // fundingId fallback to single project: PE spent 250.
        assertEquals(0, new BigDecimal("250").compareTo(project(summary, "PE").getSpentAmount()));

        // Unattributed bucket holds the ambiguous spend.
        ProjectAuditView unattributed = summary.getProjects().stream()
                .filter(p -> p.getProjectId() == null)
                .findFirst()
                .orElseThrow(() -> new AssertionError("expected an unattributed bucket"));
        assertEquals(0, new BigDecimal("150").compareTo(unattributed.getSpentAmount()));

        // Per-project spend reconciles exactly with the overall total.
        BigDecimal spentAcrossProjects = summary.getProjects().stream()
                .map(ProjectAuditView::getSpentAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        assertEquals(0, summary.getTotalSpent().compareTo(spentAcrossProjects));

        // All-events ledger covers every FUNDING/SPENDING/REFUND event, newest first, dated.
        assertEquals(7, summary.getEvents().size());
        assertEquals("r1", summary.getEvents().get(0).getEventId());
        assertEquals(LocalDate.parse("2026-01-01"), summary.getFirstEventDate());
        assertEquals(LocalDate.parse("2026-01-30"), summary.getLastEventDate());

        AuditEventLineView fundingLine = summary.getEvents().stream()
                .filter(e -> "f1".equals(e.getEventId()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("funding event f1 missing from ledger"));
        assertEquals("FUNDING", fundingLine.getEventType());
        assertEquals(LocalDate.parse("2026-01-01"), fundingLine.getDate());
        assertEquals(0, new BigDecimal("1500").compareTo(fundingLine.getAmount()));

        // A spending ledger event carries its attributed project.
        AuditEventLineView spendLine = summary.getEvents().stream()
                .filter(e -> "s1".equals(e.getEventId()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("spending event s1 missing from ledger"));
        assertEquals("Proj A", spendLine.getProjectTitle());
    }

    @Test
    void dateRangeFiltersDatedSpendButKeepsUndatedFunding() {
        List<EventEntity> events = List.of(
                event("FUNDING", "f1", "F1", "EUR", null, "1000",
                        allocation("PA", "Proj A", milestone("M1", "MS1", "1000"))),
                event("SPENDING", "in", "F1", "EUR", LocalDate.parse("2026-01-10"), "200",
                        allocation("PA", "Proj A")),
                event("SPENDING", "out", "F1", "EUR", LocalDate.parse("2026-03-10"), "999",
                        allocation("PA", "Proj A")));

        AuditSummaryView summary = AuditSummaryAssembler.assemble("org", "Org Ltd", events,
                LocalDate.parse("2026-01-01"), LocalDate.parse("2026-01-31"), null);

        // Funding (undated) kept; only the in-range spend counts, the out-of-range one is dropped.
        assertEquals(0, new BigDecimal("1000").compareTo(summary.getTotalFunded()));
        assertEquals(0, new BigDecimal("200").compareTo(summary.getTotalSpent()));
        assertEquals(1, summary.getSpendingCount());
        // The out-of-range spend is absent from the events ledger; funding + the in-range spend remain.
        assertEquals(2, summary.getEvents().size());
    }

    @Test
    void titleOnlyProjectsGetDistinctKeysSoSpendsDoNotMerge() {
        // Projects without a projectId are keyed by title; two such projects must stay distinct and
        // each spend must carry the key of the project it was attributed to.
        List<EventEntity> events = List.of(
                event("FUNDING", "f", "F", "USD", LocalDate.parse("2026-02-01"), "300",
                        allocation(null, "Alpha", milestone("MA", "MS-A", "100")),
                        allocation(null, "Beta", milestone("MB", "MS-B", "200"))),
                event("SPENDING", "sa", "F", "USD", LocalDate.parse("2026-02-05"), "50",
                        allocation(null, "Alpha")),
                event("SPENDING", "sb", "F", "USD", LocalDate.parse("2026-02-06"), "60",
                        allocation(null, "Beta")));

        AuditSummaryView summary = AuditSummaryAssembler.assemble("org", "Org Ltd", events, null, null, null);

        ProjectAuditView alpha = projectByTitle(summary, "Alpha");
        ProjectAuditView beta = projectByTitle(summary, "Beta");

        // Distinct keys even though both have a null projectId.
        assertNotEquals(alpha.getProjectKey(), beta.getProjectKey());
        assertEquals(0, new BigDecimal("50").compareTo(alpha.getSpentAmount()));
        assertEquals(0, new BigDecimal("60").compareTo(beta.getSpentAmount()));

        // Each spend's ledger row carries its own project's key — the UI groups on this.
        assertEquals(alpha.getProjectKey(), eventById(summary, "sa").getProjectKey());
        assertEquals(beta.getProjectKey(), eventById(summary, "sb").getProjectKey());
        assertNotEquals(eventById(summary, "sa").getProjectKey(), eventById(summary, "sb").getProjectKey());
    }

    private static AuditEventLineView eventById(AuditSummaryView summary, String eventId) {
        return summary.getEvents().stream()
                .filter(e -> eventId.equals(e.getEventId()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("event not found: " + eventId));
    }

    private static ProjectAuditView projectByTitle(AuditSummaryView summary, String title) {
        return summary.getProjects().stream()
                .filter(p -> title.equals(p.getProjectTitle()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("project not found: " + title));
    }

    @Test
    void projectFilterRestrictsRollUpToSelectedProjects() {
        List<EventEntity> events = List.of(
                // F1 funds a single project PA (1000); S1 spends 400 on PA.
                event("FUNDING", "f1", "F1", "USD", LocalDate.parse("2026-01-01"), "1000",
                        allocation("PA", "Proj A", milestone("M1", "MS1", "1000"))),
                event("SPENDING", "s1", "F1", "USD", LocalDate.parse("2026-01-10"), "400",
                        allocation("PA", "Proj A")),
                // F2 funds PB (500); S2 spends 200 on PB — both must be excluded when only PA is picked.
                event("FUNDING", "f2", "F2", "USD", LocalDate.parse("2026-01-02"), "500",
                        allocation("PB", "Proj B", milestone("M2", "MS2", "500"))),
                event("SPENDING", "s2", "F2", "USD", LocalDate.parse("2026-01-11"), "200",
                        allocation("PB", "Proj B")),
                // F3 funds PA (300) and PC (700) together; only PA's slice contributes to the breakdown.
                event("FUNDING", "f3", "F3", "USD", LocalDate.parse("2026-01-03"), "1000",
                        allocation("PA", "Proj A", milestone("M3", "MS3", "300")),
                        allocation("PC", "Proj C", milestone("M4", "MS4", "700"))));

        AuditSummaryView summary = AuditSummaryAssembler.assemble("org", "Org Ltd", events, null, null,
                java.util.Set.of("PA"));

        // Only the selected project appears; PB (unrelated) and PC (co-funded via F3) are excluded.
        assertEquals(1, summary.getProjects().size());
        ProjectAuditView pa = project(summary, "PA");
        assertEquals(0, new BigDecimal("1300").compareTo(pa.getAllocatedAmount()));
        assertEquals(0, new BigDecimal("400").compareTo(pa.getSpentAmount()));

        // Totals are event-granular (like the date filter): F1 + F3 are in scope for PA, F2 is not.
        assertEquals(0, new BigDecimal("2000").compareTo(summary.getTotalFunded()));
        assertEquals(0, new BigDecimal("400").compareTo(summary.getTotalSpent()));

        // Ledger keeps only the in-scope events (F1, S1, F3); the PB-only events are dropped.
        assertEquals(3, summary.getEvents().size());
        assertTrue(summary.getEvents().stream().noneMatch(e -> "s2".equals(e.getEventId())));
        assertTrue(summary.getEvents().stream().noneMatch(e -> "f2".equals(e.getEventId())));
    }

    @Test
    void handlesOrganisationWithNoEvents() {
        AuditSummaryView summary = AuditSummaryAssembler.assemble("org", "Org Ltd", List.of(), null, null, null);

        assertNotNull(summary);
        assertEquals(0, BigDecimal.ZERO.compareTo(summary.getTotalFunded()));
        assertEquals(0, BigDecimal.ZERO.compareTo(summary.getNetRemaining()));
        assertTrue(summary.getProjects().isEmpty());
        assertTrue(summary.getEvents().isEmpty());
    }
}
