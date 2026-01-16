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
public class TransactionFullView {

    private String id;
    private String txHash;
    private String internalNumber;
    private String accountingPeriod;
    private String batchId;
    private String type;
    private LocalDate date;
    private String organisationId;
    private List<TransactionItemFullView> items;

    public static TransactionFullView fromEntity(TransactionEntity entity) {
        return TransactionFullView.builder()
                .id(entity.getId())
                .txHash(entity.getTxHash())
                .internalNumber(entity.getInternalNumber())
                .accountingPeriod(entity.getAccountingPeriod())
                .batchId(entity.getBatchId())
                .type(entity.getType())
                .date(entity.getDate())
                .organisationId(entity.getOrganisationId())
                .items(entity.getItems().stream()
                        .map(TransactionItemFullView::fromEntity)
                        .toList())
                .build();
    }
}
