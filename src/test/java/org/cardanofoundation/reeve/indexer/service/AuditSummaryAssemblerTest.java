package org.cardanofoundation.reeve.indexer.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;

import org.cardanofoundation.reeve.indexer.model.entity.EventAllocationEntity;
import org.cardanofoundation.reeve.indexer.model.entity.EventEntity;
import org.cardanofoundation.reeve.indexer.model.entity.EventMilestoneEntity;
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
                // F1 funds two projects (PA:1000, PB:500).
                event("FUNDING", "f1", "F1", "USD", null, "1500",
                        allocation("PA", "Proj A", milestone("M1", "MS1", "1000")),
                        allocation("PB", "Proj B", milestone("M2", "MS2", "500"))),
                // F2 funds two projects — spends against it cannot be split, so they go unattributed.
                event("FUNDING", "f2", "F2", "USD", null, "500",
                        allocation("PC", "Proj C", milestone("M3", "MS3", "300")),
                        allocation("PD", "Proj D", milestone("M4", "MS4", "200"))),
                // F3 funds a single project (PE:700) — spends referencing it resolve to PE.
                event("FUNDING", "f3", "F3", "USD", null, "700",
                        allocation("PE", "Proj E", milestone("M5", "MS5", "700"))),
                // S1: own allocation names PA / M1 -> attributed precisely.
                event("SPENDING", "s1", "F1", "USD", LocalDate.parse("2026-01-10"), "400",
                        allocation("PA", "Proj A", milestone("M1", "MS1", "400"))),
                // S2: no allocation, fundingId F3 maps to a single project -> attributed to PE.
                event("SPENDING", "s2", "F3", "USD", LocalDate.parse("2026-01-20"), "250"),
                // S3: no allocation, fundingId F2 maps to two projects -> unattributed.
                event("SPENDING", "s3", "F2", "USD", LocalDate.parse("2026-01-25"), "150"),
                // Refund.
                event("REFUND", "r1", "F1", "USD", null, "100"));

        AuditSummaryView summary = AuditSummaryAssembler.assemble("org", "Org Ltd", events, null, null);

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

        // Spending ledger has one line per spending event, newest first.
        assertEquals(3, summary.getSpending().size());
        assertEquals("s3", summary.getSpending().get(0).getEventId());
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
                LocalDate.parse("2026-01-01"), LocalDate.parse("2026-01-31"));

        // Funding (undated) kept; only the in-range spend counts, the out-of-range one is dropped.
        assertEquals(0, new BigDecimal("1000").compareTo(summary.getTotalFunded()));
        assertEquals(0, new BigDecimal("200").compareTo(summary.getTotalSpent()));
        assertEquals(1, summary.getSpendingCount());
        assertEquals(1, summary.getSpending().size());
    }

    @Test
    void handlesOrganisationWithNoEvents() {
        AuditSummaryView summary = AuditSummaryAssembler.assemble("org", "Org Ltd", List.of(), null, null);

        assertNotNull(summary);
        assertEquals(0, BigDecimal.ZERO.compareTo(summary.getTotalFunded()));
        assertEquals(0, BigDecimal.ZERO.compareTo(summary.getNetRemaining()));
        assertTrue(summary.getProjects().isEmpty());
        assertTrue(summary.getSpending().isEmpty());
    }
}
