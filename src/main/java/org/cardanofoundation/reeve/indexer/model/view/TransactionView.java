package org.cardanofoundation.reeve.indexer.model.view;

import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import org.cardanofoundation.reeve.indexer.model.entity.TransactionEntity;

@RequiredArgsConstructor
@AllArgsConstructor
@Getter
@Builder
public class TransactionView {

    private String id;
    private String txHash;
    private String number;
    private String accountingPeriod;
    private String batchId;
    private String type;
    private LocalDate date;
    private List<TransactionItemView> items;

    public static TransactionView fromEntity(TransactionEntity entity) {
        return TransactionView.builder()
                .id(entity.getId())
                .txHash(entity.getTxHash())
                .number(entity.getNumber())
                .accountingPeriod(entity.getAccountingPeriod())
                .batchId(entity.getBatchId())
                .type(entity.getType())
                .date(entity.getDate())
                .items(entity.getItems().stream()
                        .map(TransactionItemView::fromEntity)
                        .toList())
                .build();
    }
}
