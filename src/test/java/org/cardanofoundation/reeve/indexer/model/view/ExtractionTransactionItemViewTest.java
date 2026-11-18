package org.cardanofoundation.reeve.indexer.model.view;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

import org.cardanofoundation.reeve.indexer.model.entity.TransactionEntity;
import org.cardanofoundation.reeve.indexer.model.entity.TransactionItemEntity;

class ExtractionTransactionItemViewTest {

    @Test
    void fromEntityCarriesBlockTimeOfParentTransaction() {
        TransactionEntity transaction = TransactionEntity.builder()
                .id("tx-id-1").txHash("tx-1").blockTime(1736899200L).build();
        TransactionItemEntity item = TransactionItemEntity.builder().id("item-1").build();
        transaction.addItem(item);

        ExtractionTransactionItemView view = ExtractionTransactionItemView.fromEntity(item);

        assertEquals(1736899200L, view.getBlockTime());
    }
}
