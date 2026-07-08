package org.cardanofoundation.reeve.indexer.model.view.audit;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

/**
 * Per-project roll-up for the auditor view: how much funding was allocated to the project versus how
 * much has been spent against it, broken down by milestone. The synthetic "unattributed" project
 * (id {@code null}) collects spend that could not be tied to a funded project so the per-project
 * totals still reconcile with the organisation-wide {@code totalSpent}.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProjectAuditView {

    private String projectId;
    private String projectTitle;
    private BigDecimal allocatedAmount;
    private BigDecimal spentAmount;
    private BigDecimal remaining;
    private List<MilestoneAuditView> milestones;
}
