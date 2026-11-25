package org.cardanofoundation.reeve.indexer.service.document;

import static org.mockito.Mockito.*;

import java.util.List;

import org.springframework.data.domain.Pageable;

import org.mockito.InOrder;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.cardanofoundation.reeve.indexer.model.domain.document.CheckStatus;
import org.cardanofoundation.reeve.indexer.model.domain.document.DocumentVerdict;
import org.cardanofoundation.reeve.indexer.model.entity.DocumentEntity;
import org.cardanofoundation.reeve.indexer.model.repository.DocumentRepository;

class DocumentVerificationSchedulerTest {

    private static final int MAX_BATCH = 200;

    private DocumentRepository documentRepository;
    private DocumentEnvelopeVerifier envelopeVerifier;
    private DocumentVerificationScheduler scheduler;

    @BeforeEach
    void setUp() {
        documentRepository = mock(DocumentRepository.class);
        envelopeVerifier = mock(DocumentEnvelopeVerifier.class);
        scheduler = new DocumentVerificationScheduler(documentRepository, envelopeVerifier, MAX_BATCH);
    }

    private DocumentEntity row(String txHash) {
        return DocumentEntity.builder()
                .txHash(txHash)
                .manifestCheck(CheckStatus.PASS)
                .ipfsCheck(CheckStatus.PENDING)
                .contentHashCheck(CheckStatus.PENDING)
                .envelopeCheck(CheckStatus.PENDING)
                .verdict(DocumentVerdict.PENDING)
                .build();
    }

    @Test
    void queriesFailBeforePendingAndVerifiesEveryRowFromBoth() {
        DocumentEntity failRow = row("failTx");
        DocumentEntity pendingRow = row("pendingTx");
        when(documentRepository.findByManifestCheckAndIpfsCheckAndIpfsRetryExhaustedFalse(
                eq(CheckStatus.PASS), eq(CheckStatus.FAIL), any(Pageable.class)))
                .thenReturn(List.of(failRow));
        when(documentRepository.findByManifestCheckAndIpfsCheckAndIpfsRetryExhaustedFalse(
                eq(CheckStatus.PASS), eq(CheckStatus.PENDING), any(Pageable.class)))
                .thenReturn(List.of(pendingRow));

        scheduler.retryUnresolved();

        // Query order invariant: manifest-PASS + FAIL must run before manifest-PASS + PENDING.
        // verify() can flip a PENDING row to FAIL mid-tick, so querying FAIL first avoids
        // double-fetching that row in the same sweep.
        InOrder inOrder = inOrder(documentRepository);
        inOrder.verify(documentRepository).findByManifestCheckAndIpfsCheckAndIpfsRetryExhaustedFalse(
                eq(CheckStatus.PASS), eq(CheckStatus.FAIL), any(Pageable.class));
        inOrder.verify(documentRepository).findByManifestCheckAndIpfsCheckAndIpfsRetryExhaustedFalse(
                eq(CheckStatus.PASS), eq(CheckStatus.PENDING), any(Pageable.class));

        verify(envelopeVerifier).verify(failRow);
        verify(envelopeVerifier).verify(pendingRow);
    }

    @Test
    void everyRetryQueryExcludesCondemnedRows() {
        // The per-row DoS bound is now enforced by the terminal flag: the sweep only ever asks for
        // rows with ipfsRetryExhausted = false, so a condemned/forged anchor is never re-selected.
        // Assert the scheduler calls exactly the retry-exhausted-false finder (twice) and nothing else.
        when(documentRepository.findByManifestCheckAndIpfsCheckAndIpfsRetryExhaustedFalse(
                any(), any(), any(Pageable.class))).thenReturn(List.of());

        scheduler.retryUnresolved();

        verify(documentRepository, times(2)).findByManifestCheckAndIpfsCheckAndIpfsRetryExhaustedFalse(
                eq(CheckStatus.PASS), any(), any(Pageable.class));
    }

    @Test
    void everyTickIsBoundedToTheBatchCap() {
        // The per-tick DoS bound: each query loads at most maxBatch rows, so a flood of forged
        // manifests cannot make one scheduler run do unbounded row/gateway work. Assert every query
        // is paged with page size == maxBatch (and never an unpaged/larger request).
        when(documentRepository.findByManifestCheckAndIpfsCheckAndIpfsRetryExhaustedFalse(
                any(), any(), any(Pageable.class))).thenReturn(List.of());

        scheduler.retryUnresolved();

        verify(documentRepository, times(2)).findByManifestCheckAndIpfsCheckAndIpfsRetryExhaustedFalse(
                any(), any(), argThat(p -> p != null && p.isPaged() && p.getPageSize() == MAX_BATCH));
        verify(documentRepository, never()).findByManifestCheckAndIpfsCheckAndIpfsRetryExhaustedFalse(
                any(), any(), argThat(p -> p != null && p.getPageSize() != MAX_BATCH));
    }
}
