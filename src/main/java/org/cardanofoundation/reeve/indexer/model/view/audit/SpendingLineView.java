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
 * A single SPENDING event rendered as a ledger line for the auditor view. {@code projectId}/
 * {@code projectTitle} are populated when the spend could be attributed to a project (via its own
 * allocation, or via {@code fundingId} when the funding maps to a single project); otherwise null.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SpendingLineView {

    private String eventId;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate date;

    private String vendor;
    private String spendingCategory;
    private BigDecimal amount;
    private String projectId;
    private String projectTitle;
    private String milestoneTitle;
    private String fundingId;
    private String txHash;
}
