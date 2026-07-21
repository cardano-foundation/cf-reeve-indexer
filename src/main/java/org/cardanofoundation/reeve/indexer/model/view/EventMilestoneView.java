package org.cardanofoundation.reeve.indexer.model.view;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import org.cardanofoundation.reeve.indexer.model.entity.EventMilestoneEntity;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EventMilestoneView {

    private String milestoneId;
    private String milestoneTitle;
    private BigDecimal allocatedAmount;

    public static EventMilestoneView fromEntity(EventMilestoneEntity entity) {
        return EventMilestoneView.builder()
                .milestoneId(entity.getMilestoneId())
                .milestoneTitle(entity.getMilestoneTitle())
                .allocatedAmount(entity.getAllocatedAmount())
                .build();
    }
}
