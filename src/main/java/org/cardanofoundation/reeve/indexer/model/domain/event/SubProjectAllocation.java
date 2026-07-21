package org.cardanofoundation.reeve.indexer.model.domain.event;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

/**
 * A sub-project targeted by a {@link ProjectAllocation}, owning the milestones the event applies to
 * when the allocation uses the sub-project shape.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@JsonIgnoreProperties(ignoreUnknown = true)
public class SubProjectAllocation {

    private String subProjectId;
    private String subProjectTitle;
    private List<Milestone> milestones;
}
