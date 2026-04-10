package org.cardanofoundation.reeve.indexer.model.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "reeve_excluded_tx")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class ExcludedTransactionEntity {

    @Id
    @Column(name = "transaction_id", nullable = false)
    private String transactionId;

    @Column(name = "reason")
    private String reason;

    @Column(name = "excluded_at", nullable = false)
    private LocalDateTime excludedAt;

}
