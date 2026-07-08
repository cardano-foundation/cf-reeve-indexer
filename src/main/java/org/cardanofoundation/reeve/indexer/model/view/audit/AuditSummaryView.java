package org.cardanofoundation.reeve.indexer.model.view.audit;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

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
 * Organisation-wide audit roll-up of FUNDING/SPENDING/REFUND events: headline totals, per-project
 * allocated-versus-spent breakdown and a spending ledger. Amounts are summed in the organisation's
 * primary reporting currency ({@link #currency}); mixed-currency events are not FX-normalised.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuditSummaryView {

    private String organisationId;
    private String organisationName;
    private String currency;

    private BigDecimal totalFunded;
    private BigDecimal totalSpent;
    private BigDecimal totalRefunded;
    /** {@code totalFunded - totalSpent - totalRefunded}: funds still unspent and un-refunded. */
    private BigDecimal netRemaining;

    private int fundingCount;
    private int spendingCount;
    private int refundCount;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate firstEventDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate lastEventDate;

    private List<ProjectAuditView> projects;
    private List<SpendingLineView> spending;
}
