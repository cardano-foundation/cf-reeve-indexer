package org.cardanofoundation.reeve.indexer.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import org.mockito.ArgumentCaptor;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.cardanofoundation.reeve.indexer.config.CredentialSchemaRegistry;
import org.cardanofoundation.reeve.indexer.model.domain.document.CheckStatus;
import org.cardanofoundation.reeve.indexer.model.domain.document.DocumentVerdict;
import org.cardanofoundation.reeve.indexer.model.entity.DocumentEntity;
import org.cardanofoundation.reeve.indexer.model.repository.CredentialRepository;
import org.cardanofoundation.reeve.indexer.model.repository.DocumentRepository;
import org.cardanofoundation.reeve.indexer.model.view.document.DocumentDetailResponse;
import org.cardanofoundation.reeve.indexer.model.view.document.DocumentListResponse;
import org.cardanofoundation.reeve.indexer.processor.IpfsGatewayClient;

class DocumentServiceTest {

    private DocumentRepository documentRepository;
    private IpfsGatewayClient ipfsGatewayClient;
    private CredentialRepository credentialRepository;
    private CredentialSchemaRegistry credentialSchemaRegistry;
    private DocumentService service;

    @BeforeEach
    void setUp() {
        documentRepository = mock(DocumentRepository.class);
        ipfsGatewayClient = mock(IpfsGatewayClient.class);
        credentialRepository = mock(CredentialRepository.class);
        credentialSchemaRegistry = mock(CredentialSchemaRegistry.class);
        service = new DocumentService(documentRepository, ipfsGatewayClient,
                credentialRepository, credentialSchemaRegistry, new ObjectMapper());
    }

    private DocumentEntity entity(String txHash, String docId) {
        return entity(txHash, docId, "bafyexamplecid1");
    }

    private DocumentEntity entity(String txHash, String docId, String ipfsCid) {
        return DocumentEntity.builder().txHash(txHash).documentId(docId)
                .organisationId("f".repeat(64)).ipfsCid(ipfsCid)
                .contentHash("a".repeat(64)).plaintextHash("b".repeat(64))
                .envelopeVersion(1).slotCount(2).slot(10L)
                .manifestCheck(CheckStatus.PASS)
                .ipfsCheck(CheckStatus.PASS).contentHashCheck(CheckStatus.PASS)
                .envelopeCheck(CheckStatus.PASS).verdict(DocumentVerdict.VERIFIED)
                .build();
    }

    @Test
    void listMapsEntitiesToViews() {
        when(documentRepository.search(eq("f".repeat(64)), isNull(), isNull(), any()))
                .thenReturn(new PageImpl<>(List.of(entity("tx1", "doc-1")),
                        PageRequest.of(0, 20), 1));

        DocumentListResponse response = service.list("f".repeat(64), null, null, 0, 20, "slot,desc");

        assertEquals(1, response.total());
        assertEquals(1, response.content().size());
        assertEquals("tx1", response.content().get(0).txHash());
        assertEquals(DocumentVerdict.VERIFIED, response.content().get(0).verdict());
    }

    // -----------------------------------------------------------------------------------------
    // Recipient key hash filter
    // -----------------------------------------------------------------------------------------

    private static final String HASH_A = "300c9c9603b92a4b39ed3958bf9240114804db4fd373012c0ca47432d63425ae";

    @Test
    void passesTheRecipientKeyHashStraightThroughToTheQuery() {
        when(documentRepository.search(isNull(), isNull(), eq(HASH_A), any()))
                .thenReturn(new PageImpl<>(List.of(entity("tx1", "doc-1")), PageRequest.of(0, 20), 1));

        DocumentListResponse response = service.list(null, null, HASH_A, 0, 20, "slot,desc");

        assertEquals(1, response.total());
        verify(documentRepository).search(isNull(), isNull(), eq(HASH_A), any());
    }

    @Test
    void combinesTheRecipientFilterWithOrgAndVerdict() {
        // The verdict reaches the native query as its enum NAME, since the column is a varchar.
        when(documentRepository.search(eq("org-1"), eq("VERIFIED"), eq(HASH_A), any()))
                .thenReturn(new PageImpl<>(List.of(entity("tx1", "doc-1")), PageRequest.of(0, 20), 1));

        DocumentListResponse response =
                service.list("org-1", DocumentVerdict.VERIFIED, HASH_A, 0, 20, "slot,desc");

        assertEquals(1, response.total());
        verify(documentRepository).search(eq("org-1"), eq("VERIFIED"), eq(HASH_A), any());
    }

    @Test
    void exposesRecipientKeyHashesOnTheView() {
        DocumentEntity withHashes = entity("tx1", "doc-1");
        withHashes.setRecipientKeyHashes(List.of(HASH_A));
        when(documentRepository.search(isNull(), isNull(), isNull(), any()))
                .thenReturn(new PageImpl<>(List.of(withHashes), PageRequest.of(0, 20), 1));

        DocumentListResponse response = service.list(null, null, null, 0, 20, "slot,desc");

        assertEquals(List.of(HASH_A), response.content().get(0).recipientKeyHashes());
    }

    /**
     * search() is a NATIVE query, so Spring appends this Sort straight into raw SQL. If the whitelist
     * ever emits the entity property name "blockTime" instead of the column "block_time", every sorted
     * request fails at runtime with "column does not exist" — a failure no compile step would catch.
     */
    @Test
    void sortFieldsAreTranslatedToColumnNamesForTheNativeQuery() {
        ArgumentCaptor<PageRequest> captor = ArgumentCaptor.forClass(PageRequest.class);
        when(documentRepository.search(isNull(), isNull(), isNull(), captor.capture()))
                .thenReturn(new PageImpl<>(List.of()));

        service.list(null, null, null, 0, 20, "blockTime,asc");
        assertEquals(Sort.by(Sort.Direction.ASC, "block_time"), captor.getValue().getSort());

        service.list(null, null, null, 0, 20, "createdAt,desc");
        assertEquals(Sort.by(Sort.Direction.DESC, "created_at"), captor.getValue().getSort());
    }

    @Test
    void detailReturnsAnchorsAndFlagsDuplicatesFromTheCappedList() {
        when(documentRepository.findTop100ByDocumentIdOrderBySlotAsc("doc-1"))
                .thenReturn(List.of(entity("tx1", "doc-1"), entity("tx2", "doc-1")));

        Optional<DocumentDetailResponse> detail = service.detail("doc-1");

        assertTrue(detail.isPresent());
        assertEquals(2, detail.get().anchors().size());
        assertTrue(detail.get().duplicateAnchors());
    }

    @Test
    void detailFlagsNoDuplicatesForASingleAnchor() {
        when(documentRepository.findTop100ByDocumentIdOrderBySlotAsc("doc-1"))
                .thenReturn(List.of(entity("tx1", "doc-1")));

        Optional<DocumentDetailResponse> detail = service.detail("doc-1");

        assertTrue(detail.isPresent());
        assertFalse(detail.get().duplicateAnchors());
    }

    @Test
    void detailIsEmptyForUnknownDocument() {
        when(documentRepository.findTop100ByDocumentIdOrderBySlotAsc("nope")).thenReturn(List.of());
        assertTrue(service.detail("nope").isEmpty());
    }

    @Test
    void envelopeProxyFetchesByCid() {
        when(documentRepository.findTop2ByDocumentIdOrderBySlotAsc("doc-1"))
                .thenReturn(List.of(entity("tx1", "doc-1")));
        when(ipfsGatewayClient.fetchBytes(eq("bafyexamplecid1"), anyLong()))
                .thenReturn(Optional.of("{}".getBytes()));

        byte[] envelope = service.fetchEnvelope("doc-1", null);

        assertArrayEquals("{}".getBytes(), envelope);
    }

    @Test
    void envelopeProxyWithAmbiguousAnchorsRequiresTxHash() {
        when(documentRepository.findTop2ByDocumentIdOrderBySlotAsc("doc-1"))
                .thenReturn(List.of(entity("tx1", "doc-1"), entity("tx2", "doc-1")));

        assertThrows(DocumentService.AmbiguousDocumentIdException.class,
                () -> service.fetchEnvelope("doc-1", null));
        // Disambiguated by txHash goes straight to the direct (documentId, txHash) lookup — the full
        // anchor set is never loaded on this path.
        when(documentRepository.findByDocumentIdAndTxHash("doc-1", "tx2"))
                .thenReturn(List.of(entity("tx2", "doc-1")));
        when(ipfsGatewayClient.fetchBytes(eq("bafyexamplecid1"), anyLong()))
                .thenReturn(Optional.of("{}".getBytes()));
        assertArrayEquals("{}".getBytes(), service.fetchEnvelope("doc-1", "tx2"));
    }

    @Test
    void envelopeThrowsAnchorNotFoundForUnknownDocument() {
        when(documentRepository.findTop2ByDocumentIdOrderBySlotAsc("nope")).thenReturn(List.of());

        assertThrows(DocumentService.AnchorNotFoundException.class,
                () -> service.fetchEnvelope("nope", null));
        verifyNoInteractions(ipfsGatewayClient);
    }

    @Test
    void envelopeThrowsAnchorNotFoundForUnmatchedTxHash() {
        when(documentRepository.findByDocumentIdAndTxHash("doc-1", "does-not-exist"))
                .thenReturn(List.of());

        assertThrows(DocumentService.AnchorNotFoundException.class,
                () -> service.fetchEnvelope("doc-1", "does-not-exist"));
        verifyNoInteractions(ipfsGatewayClient);
    }

    @Test
    void envelopeThrowsEnvelopeNotOnIpfsExceptionForNullCid() {
        when(documentRepository.findTop2ByDocumentIdOrderBySlotAsc("doc-1"))
                .thenReturn(List.of(entity("tx1", "doc-1", null)));

        assertThrows(DocumentService.EnvelopeNotOnIpfsException.class,
                () -> service.fetchEnvelope("doc-1", null));
        verifyNoInteractions(ipfsGatewayClient);
    }

    @Test
    void envelopeIsNotFetchedForUnverifiedIpfsAnchor() {
        // The DoS bound on the request path: an anchor whose IPFS check has not PASSed (here it FAILed
        // after exhausting the scheduler's retry budget) is not VERIFIED and must be refused WITHOUT
        // any gateway I/O — so a forged, unresolvable anchor cannot be re-fetched by hammering the proxy.
        DocumentEntity unverified = DocumentEntity.builder().txHash("tx1").documentId("doc-1")
                .organisationId("f".repeat(64)).ipfsCid("bafyexamplecid1")
                .manifestCheck(CheckStatus.PASS).ipfsCheck(CheckStatus.FAIL)
                .verdict(DocumentVerdict.IPFS_UNAVAILABLE).build();
        when(documentRepository.findTop2ByDocumentIdOrderBySlotAsc("doc-1"))
                .thenReturn(List.of(unverified));

        assertThrows(DocumentService.AnchorNotVerifiableException.class,
                () -> service.fetchEnvelope("doc-1", null));
        verifyNoInteractions(ipfsGatewayClient);
    }

    @Test
    void envelopeIsNotFetchedForContentHashMismatchAnchor() {
        // A resolvable anchor whose bytes fetched (ipfsCheck PASS) but mismatched the on-chain hash
        // is not VERIFIED: the proxy must refuse without re-fetching its known-bad CID.
        DocumentEntity mismatch = DocumentEntity.builder().txHash("tx1").documentId("doc-1")
                .organisationId("f".repeat(64)).ipfsCid("bafyexamplecid1")
                .manifestCheck(CheckStatus.PASS).ipfsCheck(CheckStatus.PASS)
                .contentHashCheck(CheckStatus.FAIL)
                .verdict(DocumentVerdict.CONTENT_HASH_MISMATCH).build();
        when(documentRepository.findTop2ByDocumentIdOrderBySlotAsc("doc-1"))
                .thenReturn(List.of(mismatch));

        assertThrows(DocumentService.AnchorNotVerifiableException.class,
                () -> service.fetchEnvelope("doc-1", null));
        verifyNoInteractions(ipfsGatewayClient);
    }

    @Test
    void envelopeIsNotFetchedForMalformedEnvelopeAnchor() {
        // Bytes that fetched and matched the content hash but form a malformed envelope are still not
        // VERIFIED — the proxy refuses without gateway I/O.
        DocumentEntity malformed = DocumentEntity.builder().txHash("tx1").documentId("doc-1")
                .organisationId("f".repeat(64)).ipfsCid("bafyexamplecid1")
                .manifestCheck(CheckStatus.PASS).ipfsCheck(CheckStatus.PASS)
                .contentHashCheck(CheckStatus.PASS).envelopeCheck(CheckStatus.FAIL)
                .verdict(DocumentVerdict.MALFORMED_ENVELOPE).build();
        when(documentRepository.findTop2ByDocumentIdOrderBySlotAsc("doc-1"))
                .thenReturn(List.of(malformed));

        assertThrows(DocumentService.AnchorNotVerifiableException.class,
                () -> service.fetchEnvelope("doc-1", null));
        verifyNoInteractions(ipfsGatewayClient);
    }

    @Test
    void envelopeThrowsGatewayFailureExceptionWhenGatewayCannotDeliver() {
        when(documentRepository.findTop2ByDocumentIdOrderBySlotAsc("doc-1"))
                .thenReturn(List.of(entity("tx1", "doc-1")));
        when(ipfsGatewayClient.fetchBytes(eq("bafyexamplecid1"), anyLong()))
                .thenReturn(Optional.empty());

        assertThrows(DocumentService.GatewayFailureException.class,
                () -> service.fetchEnvelope("doc-1", null));
    }

    @Test
    void invalidSortFieldFallsBackToSlot() {
        when(documentRepository.search(eq("f".repeat(64)), isNull(), isNull(), any()))
                .thenReturn(new PageImpl<>(List.of()));
        assertDoesNotThrow(() -> service.list("f".repeat(64), null, null, 0, 20, "evil_column,desc"));
    }

    @Test
    void invalidSortFieldFallsBackToSlotDescRegardlessOfRequestedDirection() {
        ArgumentCaptor<PageRequest> pageRequestCaptor = ArgumentCaptor.forClass(PageRequest.class);
        when(documentRepository.search(eq("f".repeat(64)), isNull(), isNull(),
                pageRequestCaptor.capture())).thenReturn(new PageImpl<>(List.of()));

        // an invalid field paired with an explicit "asc" must not leak the direction through:
        // both field and direction fall back to their defaults together.
        service.list("f".repeat(64), null, null, 0, 20, "evil_column,asc");

        assertEquals(Sort.by(Sort.Direction.DESC, "slot"), pageRequestCaptor.getValue().getSort());
    }
}
