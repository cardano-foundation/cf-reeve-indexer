package org.cardanofoundation.reeve.indexer.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.mockito.ArgumentCaptor;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.cardanofoundation.reeve.indexer.model.entity.TransactionEntity;
import org.cardanofoundation.reeve.indexer.model.entity.TransactionItemEntity;
import org.cardanofoundation.reeve.indexer.model.repository.TransactionItemRepository;
import org.cardanofoundation.reeve.indexer.model.repository.TransactionRepository;
import org.cardanofoundation.reeve.indexer.model.request.TransactionsSearchRequest;

class TransactionServiceTest {

    private TransactionItemRepository transactionItemRepository;
    private TransactionService transactionService;

    @BeforeEach
    void setUp() {
        transactionItemRepository = mock(TransactionItemRepository.class);
        transactionService = new TransactionService(mock(TransactionRepository.class), transactionItemRepository);
    }

    private TransactionItemEntity item(String id, String costCenterName, BigDecimal amountLcy) {
        return TransactionItemEntity.builder()
                .id(id)
                .amountLcy(amountLcy)
                .fxRate("1")
                .costCenterName(costCenterName)
                .transaction(TransactionEntity.builder()
                        .internalNumber("TX-1")
                        .txHash("hash-1")
                        .type("Journal")
                        .date(LocalDate.of(2024, 5, 1))
                        .blockTime(1714566896L)
                        .build())
                .build();
    }

    private void searchReturns(List<TransactionItemEntity> items, long total) {
        when(transactionItemRepository.searchItems(any(), any(), any(), any(), any(), any(), any(), any(),
                any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(new PageImpl<>(items, PageRequest.of(0, 1000), total));
    }

    private String[] downloadLines() {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        transactionService.downloadCsvTransactions(new TransactionsSearchRequest(), out);
        return out.toString(StandardCharsets.UTF_8).split("\n");
    }

    @Test
    void headerAndRowsHaveTheSameNumberOfColumns() {
        searchReturns(List.of(item("item-1", "Office", new BigDecimal("10.00"))), 1);

        String[] lines = downloadLines();

        assertEquals(2, lines.length);
        assertEquals(lines[0].split(",", -1).length, lines[1].split(",", -1).length);
    }

    @Test
    void textStartingWithAFormulaCharacterIsEscapedButNumbersAreNot() {
        searchReturns(List.of(item("item-1", "=SUM(A1)", new BigDecimal("-12.50"))), 1);

        String row = downloadLines()[1];

        assertTrue(row.contains(",'=SUM(A1),"));
        assertTrue(row.contains(",-12.5,"));
    }

    @Test
    void blockTimeIsWrittenAsReadableDate() {
        searchReturns(List.of(item("item-1", "Office", BigDecimal.ONE)), 1);

        assertTrue(downloadLines()[1].endsWith(",2024-05-01T12:34:56Z"));
    }

    @Test
    void nextPageIsLoadedWhenMoreItemsThanOnePageExist() {
        when(transactionItemRepository.searchItems(any(), any(), any(), any(), any(), any(), any(), any(),
                any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(new PageImpl<>(List.of(item("item-1", "Office", BigDecimal.ONE)), PageRequest.of(0, 1000), 1001))
                .thenReturn(new PageImpl<>(List.of(item("item-2", "Office", BigDecimal.ONE)), PageRequest.of(1, 1000), 1001));

        String[] lines = downloadLines();

        assertEquals(3, lines.length);
        ArgumentCaptor<Pageable> pageables = ArgumentCaptor.forClass(Pageable.class);
        verify(transactionItemRepository, times(2)).searchItems(any(), any(), any(), any(), any(), any(), any(),
                any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), pageables.capture());
        assertEquals(PageRequest.of(0, 1000, Sort.by("i.id")), pageables.getAllValues().get(0));
        assertEquals(PageRequest.of(1, 1000, Sort.by("i.id")), pageables.getAllValues().get(1));
    }

    @Test
    void failedSearchStopsAfterTheHeader() {
        when(transactionItemRepository.searchItems(any(), any(), any(), any(), any(), any(), any(), any(),
                any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenThrow(new RuntimeException("db down"));

        assertEquals(1, downloadLines().length);
    }
}
