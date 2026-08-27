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

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SubProjectAuditView {

    private String subProjectId;
    private String subProjectTitle;
    private BigDecimal allocatedAmount;
    private BigDecimal refundedAmount;
    private BigDecimal spentAmount;
    private List<MilestoneAuditView> milestones;
}
