package org.cardanofoundation.reeve.indexer.model.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A project targeted by an {@link EventEntity}, owning the milestones the event applies to.
 */
@Entity
@Table(name = "reeve_event_allocation")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class EventAllocationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "reeve_event_allocation_seq_gen")
    @SequenceGenerator(name = "reeve_event_allocation_seq_gen",
            sequenceName = "reeve_event_allocation_seq", allocationSize = 50)
    @Column(name = "id")
    private Long id;

    @Column(name = "project_id")
    private String projectId;

    @Column(name = "project_title")
    private String projectTitle;

    @Column(name = "sub_project_title")
    private String subProjectTitle;

    @ManyToOne
    @JoinColumn(name = "event_ref_id", referencedColumnName = "id", nullable = false)
    private EventEntity event;

    @OneToMany(mappedBy = "allocation", orphanRemoval = true, cascade = CascadeType.ALL)
    @Builder.Default
    private List<EventMilestoneEntity> milestones = new ArrayList<>();

    public void addMilestone(EventMilestoneEntity milestone) {
        milestones.add(milestone);
        milestone.setAllocation(this);
    }
}
