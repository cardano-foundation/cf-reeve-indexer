package org.cardanofoundation.reeve.indexer.model.entity;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "reeve_transactions")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class TransactionEntity {

    @Id
    @Column(name = "id", nullable = false)
    private String id;
    @Column(name = "tx_hash", nullable = false)
    private String txHash;
    @Column(name = "number", nullable = false)
    private String number;
    @Column(name = "accounting_period", nullable = false)
    private String accountingPeriod;
    @Column(name = "batch_id", nullable = false)
    private String batchId;
    @Column(name = "type", nullable = false)
    private String type;
    @Column(name = "date", nullable = false)
    private LocalDate date;
    @OneToMany(mappedBy = "transaction", orphanRemoval = true, cascade = CascadeType.ALL)
    @Builder.Default
    private List<TransactionItemEntity> items = new ArrayList<>();

    @Column(name = "organisation_id", nullable = false)
    private String organisationId;

    public void addItem(TransactionItemEntity item) {
        items.add(item);
        item.setTransaction(this);
    }
}
