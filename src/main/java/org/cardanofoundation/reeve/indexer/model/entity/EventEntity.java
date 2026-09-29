package org.cardanofoundation.reeve.indexer.model.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * A single {@code FUNDING} bundle event. Top-level, queryable fields — including the inline spend
 * record for SPENDING events — are stored as columns, while the nested allocations live in a
 * dedicated child table. Free-form custom-event fields and the original event JSON are preserved as
 * JSONB for forward compatibility.
 */
@Entity
@Table(name = "reeve_event", uniqueConstraints = @UniqueConstraint(name = "uq_reeve_event_tx_event",
        columnNames = {"tx_hash", "event_id"}))
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class EventEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "reeve_event_seq_gen")
    @SequenceGenerator(name = "reeve_event_seq_gen", sequenceName = "reeve_event_seq",
            allocationSize = 50)
    @Column(name = "id")
    private Long id;

    @Column(name = "tx_hash", nullable = false)
    private String txHash;

    @Column(name = "organisation_id", nullable = false)
    private String organisationId;

    @Column(name = "event_id", nullable = false)
    private String eventId;

    @Column(name = "event_type", nullable = false)
    private String eventType;

    @Column(name = "event_category", nullable = false)
    private String eventCategory;

    @Column(name = "funding_tx")
    private String fundingTx;

    @Column(name = "funding_id")
    private String fundingId;

    @Column(name = "funding_entity")
    private String fundingEntity;

    // Inline spend record (SPENDING events).
    @Column(name = "amount_rcy")
    private BigDecimal amountRcy;

    @Column(name = "amount_fcy")
    private BigDecimal amountFcy;

    @Column(name = "vendor")
    private String vendor;

    @Column(name = "spending_category")
    private String spendingCategory;

    @Column(name = "fx_rate")
    private String fxRate;

    @Column(name = "hash")
    private String hash;

    @Column(name = "notes")
    private String notes;

    @Column(name = "currency_id")
    private String currencyId;

    @Column(name = "currency_cust_code")
    private String currencyCustCode;

    @Column(name = "currency_fcy_id")
    private String currencyFcyId;

    @Column(name = "currency_fcy_cust_code")
    private String currencyFcyCustCode;

    @Column(name = "date")
    private LocalDate date;

    @Column(name = "version")
    private String version;

    @Column(name = "creation_slot")
    private Long creationSlot;

    @Column(name = "event_timestamp")
    private String eventTimestamp;

    @Column(name = "ipfs_cid")
    private String ipfsCid;

    @Column(name = "metadata_hash")
    private String metadataHash;

    @Column(name = "total_amount")
    private BigDecimal totalAmount;

    @Column(name = "custom_data", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String customData;

    @Column(name = "raw", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String raw;

    @OneToMany(mappedBy = "event", orphanRemoval = true, cascade = CascadeType.ALL)
    @Builder.Default
    private List<EventAllocationEntity> allocations = new ArrayList<>();

    public void addAllocation(EventAllocationEntity allocation) {
        allocations.add(allocation);
        allocation.setEvent(this);
    }
}
