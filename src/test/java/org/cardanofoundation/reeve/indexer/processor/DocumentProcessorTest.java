package org.cardanofoundation.reeve.indexer.processor;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Optional;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.mockito.ArgumentCaptor;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.cardanofoundation.reeve.indexer.model.domain.Organisation;
import org.cardanofoundation.reeve.indexer.model.domain.ReeveTransactionType;
import org.cardanofoundation.reeve.indexer.model.domain.document.CheckStatus;
import org.cardanofoundation.reeve.indexer.model.domain.document.DocumentVerdict;
import org.cardanofoundation.reeve.indexer.model.domain.metadata.ReeveMetadata;
import org.cardanofoundation.reeve.indexer.model.entity.DocumentEntity;
import org.cardanofoundation.reeve.indexer.model.repository.DocumentRepository;

class DocumentProcessorTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private DocumentRepository documentRepository;
    private DocumentProcessor processor;

    @BeforeEach
    void setUp() {
        documentRepository = mock(DocumentRepository.class);
        processor = new DocumentProcessor(documentRepository);
        when(documentRepository.findById(any())).thenReturn(Optional.empty());
    }

    private ReeveMetadata metadata(String dataJson) throws Exception {
        ReeveMetadata metadata = new ReeveMetadata();
        metadata.setType(ReeveTransactionType.DOCUMENT);
        metadata.setTxHash("tx-doc-1");
        metadata.setSlot(4567L);
        Organisation org = new Organisation();
        org.setId("f".repeat(64));
        metadata.setOrg(org);
        if (dataJson != null) {
            metadata.setData(objectMapper.readTree(dataJson));
        }
        return metadata;
    }

    private static String validData() {
        return """
            {"id":"3fa85f64-5717-4562-b3fc-2c963f66afa6","ipfs_cid":"bafybeigdyrzt5examplecid",
             "content_hash":"%s","plaintext_hash":"%s","envelope_version":1,"slot_count":3}
            """.formatted("a".repeat(64), "b".repeat(64));
    }

    @Test
    void supportsDocumentType() {
        assertEquals(ReeveTransactionType.DOCUMENT, processor.supportedType());
    }

    @Test
    void validManifestIndexesWithManifestPassAndPendingChecks() throws Exception {
        processor.process(metadata(validData()));

        ArgumentCaptor<DocumentEntity> captor = ArgumentCaptor.forClass(DocumentEntity.class);
        verify(documentRepository).save(captor.capture());
        DocumentEntity entity = captor.getValue();
        assertEquals("tx-doc-1", entity.getTxHash());
        assertEquals("3fa85f64-5717-4562-b3fc-2c963f66afa6", entity.getDocumentId());
        assertEquals("f".repeat(64), entity.getOrganisationId());
        assertEquals("bafybeigdyrzt5examplecid", entity.getIpfsCid());
        assertEquals("a".repeat(64), entity.getContentHash());
        assertEquals("b".repeat(64), entity.getPlaintextHash());
        assertEquals(1, entity.getEnvelopeVersion());
        assertEquals(3, entity.getSlotCount());
        assertEquals(4567L, entity.getSlot());
        assertEquals(CheckStatus.PASS, entity.getManifestCheck());
        assertEquals(CheckStatus.PENDING, entity.getIpfsCheck());
        assertEquals(DocumentVerdict.PENDING, entity.getVerdict());
    }

    @Test
    void missingRequiredFieldIndexesAsMalformedManifest() throws Exception {
        processor.process(metadata("{\"id\":\"doc-1\",\"ipfs_cid\":\"bafyexamplecid1\"}"));

        ArgumentCaptor<DocumentEntity> captor = ArgumentCaptor.forClass(DocumentEntity.class);
        verify(documentRepository).save(captor.capture());
        assertEquals(CheckStatus.FAIL, captor.getValue().getManifestCheck());
        assertEquals(DocumentVerdict.MALFORMED_MANIFEST, captor.getValue().getVerdict());
    }

    @Test
    void invalidHashShapeIsMalformed() throws Exception {
        String bad = validData().replace("a".repeat(64), "ZZ".repeat(32));
        processor.process(metadata(bad));

        ArgumentCaptor<DocumentEntity> captor = ArgumentCaptor.forClass(DocumentEntity.class);
        verify(documentRepository).save(captor.capture());
        DocumentEntity entity = captor.getValue();
        assertEquals(DocumentVerdict.MALFORMED_MANIFEST, entity.getVerdict());
        // Partial capture: fields that individually parsed fine are still captured even
        // though the manifest as a whole is malformed; only the bad field is left null.
        assertEquals("3fa85f64-5717-4562-b3fc-2c963f66afa6", entity.getDocumentId());
        assertEquals("bafybeigdyrzt5examplecid", entity.getIpfsCid());
        assertEquals("b".repeat(64), entity.getPlaintextHash());
        assertEquals(1, entity.getEnvelopeVersion());
        assertEquals(3, entity.getSlotCount());
        assertNull(entity.getContentHash());
    }

    @Test
    void pathTraversalCidIsMalformed() throws Exception {
        String bad = """
            {"id":"doc-1","ipfs_cid":"../../etc","content_hash":"%s",
             "plaintext_hash":"%s","envelope_version":1,"slot_count":1}
            """.formatted("a".repeat(64), "b".repeat(64));
        processor.process(metadata(bad));

        ArgumentCaptor<DocumentEntity> captor = ArgumentCaptor.forClass(DocumentEntity.class);
        verify(documentRepository).save(captor.capture());
        assertEquals(DocumentVerdict.MALFORMED_MANIFEST, captor.getValue().getVerdict());
    }

    @Test
    void missingDataNodeIsMalformed() throws Exception {
        processor.process(metadata(null));

        ArgumentCaptor<DocumentEntity> captor = ArgumentCaptor.forClass(DocumentEntity.class);
        verify(documentRepository).save(captor.capture());
        assertEquals(DocumentVerdict.MALFORMED_MANIFEST, captor.getValue().getVerdict());
    }

    @Test
    void missingOrgIsMalformedButStillIndexed() throws Exception {
        ReeveMetadata metadata = metadata(validData());
        metadata.setOrg(null);
        processor.process(metadata);

        ArgumentCaptor<DocumentEntity> captor = ArgumentCaptor.forClass(DocumentEntity.class);
        verify(documentRepository).save(captor.capture());
        assertNull(captor.getValue().getOrganisationId());
        assertEquals(DocumentVerdict.MALFORMED_MANIFEST, captor.getValue().getVerdict());
    }

    @Test
    void fractionalEnvelopeVersionIsMalformed() throws Exception {
        String bad = validData().replace("\"envelope_version\":1", "\"envelope_version\":1.9");
        processor.process(metadata(bad));

        ArgumentCaptor<DocumentEntity> captor = ArgumentCaptor.forClass(DocumentEntity.class);
        verify(documentRepository).save(captor.capture());
        DocumentEntity entity = captor.getValue();
        assertEquals(DocumentVerdict.MALFORMED_MANIFEST, entity.getVerdict());
        assertNull(entity.getEnvelopeVersion()); // truncation would silently accept 1.9 as 1
    }

    @Test
    void reprocessingWithIdenticalManifestPreservesVerifiedState() throws Exception {
        // Same manifest-derived fields as validData()/metadata() below: a reorg replay or
        // backfill re-parse of an immutable on-chain tx must not un-verify a VERIFIED row.
        DocumentEntity existing = DocumentEntity.builder().txHash("tx-doc-1")
                .documentId("3fa85f64-5717-4562-b3fc-2c963f66afa6")
                .organisationId("f".repeat(64))
                .ipfsCid("bafybeigdyrzt5examplecid")
                .contentHash("a".repeat(64))
                .plaintextHash("b".repeat(64))
                .envelopeVersion(1)
                .slotCount(3)
                .slot(100L) // stale slot from an earlier parse
                .blockTime(999L)
                .manifestCheck(CheckStatus.PASS)
                .ipfsCheck(CheckStatus.PASS)
                .contentHashCheck(CheckStatus.PASS)
                .envelopeCheck(CheckStatus.PASS)
                .ipfsAttempts(5)
                .verdict(DocumentVerdict.VERIFIED)
                .build();
        when(documentRepository.findById("tx-doc-1")).thenReturn(Optional.of(existing));

        processor.process(metadata(validData()));

        ArgumentCaptor<DocumentEntity> captor = ArgumentCaptor.forClass(DocumentEntity.class);
        verify(documentRepository).save(captor.capture());
        DocumentEntity saved = captor.getValue();
        assertEquals(DocumentVerdict.VERIFIED, saved.getVerdict());
        assertEquals(CheckStatus.PASS, saved.getManifestCheck());
        assertEquals(CheckStatus.PASS, saved.getIpfsCheck());
        assertEquals(CheckStatus.PASS, saved.getContentHashCheck());
        assertEquals(CheckStatus.PASS, saved.getEnvelopeCheck());
        assertEquals(5, saved.getIpfsAttempts()); // bookkeeping preserved
        assertEquals(999L, saved.getBlockTime()); // bookkeeping preserved
        assertEquals(4567L, saved.getSlot()); // only slot is refreshed from the fresh parse
    }

    @Test
    void reprocessingWithChangedContentHashRebuildsFreshEntity() throws Exception {
        DocumentEntity existing = DocumentEntity.builder().txHash("tx-doc-1")
                .documentId("3fa85f64-5717-4562-b3fc-2c963f66afa6")
                .organisationId("f".repeat(64))
                .ipfsCid("bafybeigdyrzt5examplecid")
                .contentHash("c".repeat(64)) // differs from the fresh parse's "a"*64
                .plaintextHash("b".repeat(64))
                .envelopeVersion(1)
                .slotCount(3)
                .manifestCheck(CheckStatus.PASS)
                .ipfsCheck(CheckStatus.PASS)
                .contentHashCheck(CheckStatus.PASS)
                .envelopeCheck(CheckStatus.PASS)
                .verdict(DocumentVerdict.VERIFIED)
                .build();
        when(documentRepository.findById("tx-doc-1")).thenReturn(Optional.of(existing));

        processor.process(metadata(validData()));

        ArgumentCaptor<DocumentEntity> captor = ArgumentCaptor.forClass(DocumentEntity.class);
        verify(documentRepository).save(captor.capture());
        DocumentEntity saved = captor.getValue();
        assertEquals("a".repeat(64), saved.getContentHash()); // fresh value, not the stale "c"*64
        assertEquals(CheckStatus.PASS, saved.getManifestCheck());
        assertEquals(CheckStatus.PENDING, saved.getIpfsCheck());
        assertEquals(CheckStatus.PENDING, saved.getContentHashCheck());
        assertEquals(CheckStatus.PENDING, saved.getEnvelopeCheck());
        assertEquals(DocumentVerdict.PENDING, saved.getVerdict());
    }

    @Test
    void processorNeverThrowsOnGarbage() throws Exception {
        ReeveMetadata metadata = new ReeveMetadata(); // everything null except type
        metadata.setType(ReeveTransactionType.DOCUMENT);
        metadata.setTxHash("tx-garbage");
        assertDoesNotThrow(() -> processor.process(metadata));
    }
}
