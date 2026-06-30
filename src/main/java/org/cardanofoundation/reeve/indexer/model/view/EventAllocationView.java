package org.cardanofoundation.reeve.indexer.model.view;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import org.cardanofoundation.reeve.indexer.model.entity.EventAllocationEntity;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EventAllocationView {

    private String projectId;
    private String projectTitle;
    private String subProjectTitle;
    private List<EventMilestoneView> milestones;

    public static EventAllocationView fromEntity(EventAllocationEntity entity) {
        return EventAllocationView.builder()
                .projectId(entity.getProjectId())
                .projectTitle(entity.getProjectTitle())
                .subProjectTitle(entity.getSubProjectTitle())
                .milestones(entity.getMilestones().stream()
                        .map(EventMilestoneView::fromEntity)
                        .toList())
                .build();
    }
}
