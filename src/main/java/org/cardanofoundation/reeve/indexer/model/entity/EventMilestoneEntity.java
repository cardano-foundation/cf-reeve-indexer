package org.cardanofoundation.reeve.indexer.model.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A milestone of an {@link EventAllocationEntity}, with its amount in the reporting currency.
 */
@Entity
@Table(name = "reeve_event_milestone")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class EventMilestoneEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "reeve_event_milestone_seq_gen")
    @SequenceGenerator(name = "reeve_event_milestone_seq_gen",
            sequenceName = "reeve_event_milestone_seq", allocationSize = 50)
    @Column(name = "id")
    private Long id;

    @Column(name = "milestone_id")
    private String milestoneId;

    @Column(name = "milestone_title")
    private String milestoneTitle;

    @Column(name = "amount_rcy")
    private BigDecimal amountRcy;

    @ManyToOne
    @JoinColumn(name = "allocation_id", referencedColumnName = "id", nullable = false)
    private EventAllocationEntity allocation;
}
