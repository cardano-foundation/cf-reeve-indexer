package org.cardanofoundation.reeve.indexer.model.view.audit;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

/**
 * Per-milestone roll-up for the auditor view: the amount a FUNDING event allocated to the milestone
 * versus the amount SPENDING events explicitly booked against it.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MilestoneAuditView {

    private String milestoneId;
    private String milestoneTitle;
    private BigDecimal allocatedAmount;
    private BigDecimal spentAmount;
}
