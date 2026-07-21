package org.cardanofoundation.reeve.indexer.model.domain.event;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

/**
 * A single project targeted by an event. Milestones are attached either directly (via
 * {@link #milestones}) or through a {@link #subProject} — the two shapes are mutually exclusive per
 * the on-chain schema. Use {@link #getEffectiveMilestones()} to read the applicable milestones
 * regardless of shape.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProjectAllocation {

    private String projectId;
    private String projectTitle;

    /** Milestones targeted directly on the project (direct-allocation shape). */
    private List<Milestone> milestones;

    /** Sub-project container, present instead of {@link #milestones} for the sub-project shape. */
    private SubProjectAllocation subProject;

    /** The applicable milestones, whether attached directly or nested under a sub-project. */
    @JsonIgnore
    public List<Milestone> getEffectiveMilestones() {
        return subProject != null ? subProject.getMilestones() : milestones;
    }

    @JsonIgnore
    public String getSubProjectId() {
        return subProject != null ? subProject.getSubProjectId() : null;
    }

    @JsonIgnore
    public String getSubProjectTitle() {
        return subProject != null ? subProject.getSubProjectTitle() : null;
    }
}
