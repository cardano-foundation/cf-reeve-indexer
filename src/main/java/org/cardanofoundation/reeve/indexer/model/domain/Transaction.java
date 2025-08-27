package org.cardanofoundation.reeve.indexer.model.domain;

import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import org.cardanofoundation.reeve.indexer.model.entity.TransactionEntity;

@Getter
@Setter
@RequiredArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    private String id;
    private String number;
    private String batchId;
    private String accountingPeriod;
    private String type;
    private LocalDate date;
    private List<TransactionItem> items;

    public TransactionEntity toEntity() {
        TransactionEntity transactionEntity = TransactionEntity.builder()
                .id(id)
                .number(number)
                .batchId(batchId)
                .accountingPeriod(accountingPeriod)
                .type(type)
                .date(date)
                .build();
        items.forEach(item -> transactionEntity.addItem(item.toEntity()));
        return transactionEntity;
    }
}
