package org.cardanofoundation.reeve.indexer.service.document;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import java.util.List;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.cardanofoundation.reeve.indexer.config.CredentialSchemaRegistry;
import org.cardanofoundation.reeve.indexer.model.domain.document.CheckStatus;
import org.cardanofoundation.reeve.indexer.model.domain.document.DocumentVerdict;
import org.cardanofoundation.reeve.indexer.model.entity.DocumentEntity;
import org.cardanofoundation.reeve.indexer.model.repository.CredentialRepository;
import org.cardanofoundation.reeve.indexer.model.repository.DocumentRepository;
import org.cardanofoundation.reeve.indexer.processor.IpfsGatewayClient;

/**
 * A fetch every gateway refused with 429/503 says nothing about the content, so it must not consume
 * the row's retry budget: neither the attempt count nor the IPFS check moves, and the row is never
 * condemned for it. The read proxy keeps answering as it does for any gateway failure.
 */
class DocumentEnvelopeRateLimitTest {

    private static final String CID = "bafyexamplecid1";

    private IpfsGatewayClient ipfsGatewayClient;
    private DocumentRepository documentRepository;

    @BeforeEach
    void setUp() {
        ipfsGatewayClient = mock(IpfsGatewayClient.class);
        documentRepository = mock(DocumentRepository.class);
        when(ipfsGatewayClient.fetchBytes(eq(CID), anyLong()))
                .thenThrow(new IpfsGatewayClient.IpfsRateLimitedException(CID));
    }

    private static DocumentEntity pending(int attempts, CheckStatus ipfsCheck) {
        return DocumentEntity.builder()
                .txHash("tx1").documentId("doc-1").ipfsCid(CID)
                .contentHash("a".repeat(64)).plaintextHash("b".repeat(64))
                .envelopeVersion(1).recipientCount(1).slot(10L)
                .organisationId("f".repeat(64))
                .manifestCheck(CheckStatus.PASS)
                .ipfsCheck(ipfsCheck).contentHashCheck(CheckStatus.PENDING)
                .envelopeCheck(CheckStatus.PENDING).verdict(DocumentVerdict.PENDING)
                .ipfsAttempts(attempts)
                .build();
    }

    @Test
    void rateLimitedFetchDoesNotCountAsAnAttempt() {
        DocumentEnvelopeVerifier verifier = new DocumentEnvelopeVerifier(ipfsGatewayClient, documentRepository,
                new ObjectMapper(), 3, 12);
        DocumentEntity entity = pending(2, CheckStatus.PENDING);

        verifier.verify(entity);

        assertEquals(2, entity.getIpfsAttempts());
        assertEquals(CheckStatus.PENDING, entity.getIpfsCheck());
        assertFalse(entity.isIpfsRetryExhausted());
    }

    @Test
    void rateLimitedFetchNeverCondemnsARowAtTheLastAttempt() {
        DocumentEnvelopeVerifier verifier = new DocumentEnvelopeVerifier(ipfsGatewayClient, documentRepository,
                new ObjectMapper(), 3, 12);
        DocumentEntity entity = pending(11, CheckStatus.FAIL);

        verifier.verify(entity);

        assertEquals(11, entity.getIpfsAttempts());
        assertFalse(entity.isIpfsRetryExhausted());
    }

    @Test
    void readProxyStillReportsAGatewayFailure() {
        DocumentEntity verified = pending(0, CheckStatus.PASS);
        verified.setContentHashCheck(CheckStatus.PASS);
        verified.setEnvelopeCheck(CheckStatus.PASS);
        verified.setVerdict(DocumentVerdict.VERIFIED);
        when(documentRepository.findTop2ByDocumentIdOrderBySlotAsc("doc-1")).thenReturn(List.of(verified));
        DocumentService service = new DocumentService(documentRepository, ipfsGatewayClient,
                mock(CredentialRepository.class), mock(CredentialSchemaRegistry.class), new ObjectMapper());

        assertThrows(DocumentService.GatewayFailureException.class, () -> service.fetchEnvelope("doc-1", null));
    }
}
