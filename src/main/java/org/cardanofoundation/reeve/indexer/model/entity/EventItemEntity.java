package org.cardanofoundation.reeve.indexer.model.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

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
 * A line item of a grant-lifecycle {@link EventEntity} (e.g. an expenditure for a SPENDING event).
 */
@Entity
@Table(name = "reeve_event_item")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class EventItemEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "reeve_event_item_seq_gen")
    @SequenceGenerator(name = "reeve_event_item_seq_gen", sequenceName = "reeve_event_item_seq",
            allocationSize = 50)
    @Column(name = "id")
    private Long id;

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

    @Column(name = "date")
    private LocalDate date;

    @Column(name = "currency_id")
    private String currencyId;

    @Column(name = "currency_cust_code")
    private String currencyCustCode;

    @ManyToOne
    @JoinColumn(name = "event_ref_id", referencedColumnName = "id", nullable = false)
    private EventEntity event;
}
