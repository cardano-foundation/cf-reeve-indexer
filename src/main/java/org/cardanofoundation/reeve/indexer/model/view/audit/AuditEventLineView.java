package org.cardanofoundation.reeve.indexer.model.view.audit;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

/**
 * A single grant event (FUNDING/SPENDING/REFUND) rendered as a chronological ledger row for the
 * auditor view. Carries the identifiers needed to drill into the event's full detail
 * ({@code txHash} + {@code eventId}) and its on-chain references ({@code txHash}, {@code fundingTx}).
 * Spending-only fields ({@code vendor}, {@code spendingCategory}, {@code projectId}/
 * {@code projectTitle}) are null for funding/refund events.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuditEventLineView {

    private String eventId;
    private String txHash;
    private String fundingTx;
    private String eventType;
    private String eventCategory;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate date;

    private BigDecimal amount;
    private String currency;
    private String fundingId;
    private String fundingEntity;
    private String vendor;
    private String spendingCategory;
    /** Matches {@link ProjectAuditView#getProjectKey()} for the project this spend was attributed to
     * (null for funding/refund rows). Lets the UI group spends under the right project even when
     * {@code projectId} is null. */
    private String projectKey;
    private String projectId;
    private String projectTitle;
}
