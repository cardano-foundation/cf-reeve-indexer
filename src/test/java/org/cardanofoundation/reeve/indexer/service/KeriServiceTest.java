package org.cardanofoundation.reeve.indexer.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.test.util.ReflectionTestUtils;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.cardanofoundation.reeve.indexer.config.CredentialSchema;
import org.cardanofoundation.reeve.indexer.config.CredentialSchemaRegistry;
import org.cardanofoundation.reeve.indexer.config.KeriProperties;
import org.cardanofoundation.reeve.indexer.model.entity.CredentialEntity;
import org.cardanofoundation.reeve.indexer.model.entity.DocumentEntity;
import org.cardanofoundation.reeve.indexer.model.entity.IdentityEventEntity;
import org.cardanofoundation.reeve.indexer.model.entity.ReportEntity;
import org.cardanofoundation.reeve.indexer.model.repository.CredentialRepository;
import org.cardanofoundation.reeve.indexer.model.repository.DocumentRepository;
import org.cardanofoundation.reeve.indexer.model.repository.ReportRepository;
import org.cardanofoundation.signify.app.clienting.SignifyClient;
import org.cardanofoundation.signify.app.coring.Coring;

/**
 * Covers the parts of {@link KeriService} that don't require fabricating a real CESR/KEL stream:
 * the schema gate + exception isolation in {@code verifyCredentialEntity}, and the report/document
 * correlation + shared ATTEST gate in {@code verifyIdentityTx}.
 *
 * <p>TODO(test): the chained (vLEI, trusted-root walk) and standalone (trusted-issuer + revocation)
 * trust-path branches inside {@code verifyCredentialEntity} require a parsed CESR chain
 * ({@code CESRStreamUtil.parseCESRData}) containing vcp/iss/ACDC-shaped events plus a mocked
 * {@code registries().verify(...)} round trip. Hand-building a minimal-but-accepted synthetic
 * chain for both trust models proved brittle to keep in lockstep with the parser's internals, so
 * those branches are intentionally left uncovered here rather than shipping fragile tests; see the
 * design doc's `docs/vectors` fixture direction for a follow-up.
 */
class KeriServiceTest {

    private ReportRepository reportRepository;
    private DocumentRepository documentRepository;
    private CredentialRepository credentialRepository;
    private CredentialSchemaRegistry credentialSchemaRegistry;
    private KeriProperties keriProperties;
    private SignifyClient signifyClient;

    @BeforeEach
    void setUp() {
        reportRepository = mock(ReportRepository.class);
        documentRepository = mock(DocumentRepository.class);
        credentialRepository = mock(CredentialRepository.class);
        credentialSchemaRegistry = mock(CredentialSchemaRegistry.class);
        keriProperties = new KeriProperties();
        signifyClient = mock(SignifyClient.class);
    }

    private KeriService service(Optional<SignifyClient> client, boolean keriEnabled) {
        KeriService keriService = new KeriService(client, keriProperties, credentialSchemaRegistry,
                reportRepository, documentRepository, credentialRepository);
        ReflectionTestUtils.setField(keriService, "keriEnabled", keriEnabled);
        return keriService;
    }

    /** A KEL whose event at index 0 anchors {@code dataHash} in its {@code a[0]} seal (the plain
     *  string-seal shape {@code verifyEvent} checks first). */
    private static List<Object> kelAnchoring(String dataHash) {
        Map<String, Object> ked = Map.of("a", List.of(dataHash));
        Map<String, Object> kelEvent = Map.of("ked", ked);
        return List.of(kelEvent);
    }

    // ------------------------------------------------------------------
    // verifyCredentialEntity
    // ------------------------------------------------------------------

    @Test
    void verifyCredentialEntityRejectsAnUnknownSchemaWithoutTouchingCesrOrOobis() {
        when(credentialSchemaRegistry.forSaid("unknown-said")).thenReturn(Optional.empty());
        KeriService keriService = service(Optional.of(signifyClient), true);

        CredentialEntity entity = CredentialEntity.builder()
                .prefixId("EPrefix1")
                .schemaSaid("unknown-said")
                .credentialChain("[\"deadbeef\"]")
                .build();

        keriService.verifyCredentialEntity(entity, null);

        assertEquals(Boolean.FALSE, entity.getValid());
        // Bailing out on the schema gate must happen before any OOBI resolution or CESR/registry
        // work touches the signify client.
        verifyNoInteractions(signifyClient);
        verify(credentialSchemaRegistry, never()).all();
    }

    @Test
    void verifyCredentialEntityIsolatesACollaboratorExceptionAndDoesNotPropagate() {
        CredentialSchema schema = new CredentialSchema("SAID1", "Test Schema", false, List.of(), List.of(),
                List.of("http://oobi.example/1"));
        when(credentialSchemaRegistry.forSaid("SAID1")).thenReturn(Optional.of(schema));
        when(credentialSchemaRegistry.all()).thenReturn(List.of(schema));
        // Deliberately blow up the signify client mid-flow (OOBI resolution, which runs before any
        // CESR parsing) to prove verifyCredentialEntity isolates a collaborator failure per-item
        // instead of letting it propagate and abort the surrounding metadata batch.
        when(signifyClient.oobis()).thenThrow(new RuntimeException("boom - signify client unreachable"));

        KeriService keriService = service(Optional.of(signifyClient), true);
        CredentialEntity entity = CredentialEntity.builder()
                .prefixId("EPrefix1")
                .schemaSaid("SAID1")
                .credentialChain("[\"deadbeef\"]")
                .build();

        assertDoesNotThrow(() -> keriService.verifyCredentialEntity(entity, null));

        assertEquals(Boolean.FALSE, entity.getValid());
        verify(signifyClient, atLeastOnce()).oobis();
    }

    // ------------------------------------------------------------------
    // verifyIdentityTx
    // ------------------------------------------------------------------

    @Test
    void verifyIdentityTxIsANoOpWhenKeriIsDisabled() {
        KeriService keriService = service(Optional.of(signifyClient), false);
        IdentityEventEntity identityEntity = IdentityEventEntity.builder()
                .txHash("tx1").sequenceNumber("0").dataHash("hash-abc").identifier("EAID1")
                .type("ATTEST").build();

        keriService.verifyIdentityTx(identityEntity);

        verifyNoInteractions(reportRepository, documentRepository, credentialRepository, signifyClient);
    }

    @Test
    void verifyIdentityTxDoesNotVerifyOrSaveWhenMetadataHashDiffersFromDataHash() {
        KeriService keriService = service(Optional.of(signifyClient), true);
        ReportEntity report = ReportEntity.builder().id(1L).txHash("tx1")
                .metadataHash("some-other-hash").organisationId("org-1").build();
        when(reportRepository.findByTxHash("tx1")).thenReturn(Optional.of(report));

        IdentityEventEntity identityEntity = IdentityEventEntity.builder()
                .txHash("tx1").sequenceNumber("0").dataHash("hash-abc").identifier("EAID1")
                .type("ATTEST").build();

        keriService.verifyIdentityTx(identityEntity);

        assertFalse(report.isIdentityVerified());
        verify(reportRepository, never()).save(any());
        verifyNoInteractions(documentRepository, credentialRepository, signifyClient);
    }

    @Test
    void verifyIdentityTxIsANoOpWhenNeitherReportNorDocumentMatchesTheTxHash() {
        KeriService keriService = service(Optional.of(signifyClient), true);
        when(reportRepository.findByTxHash("tx1")).thenReturn(Optional.empty());
        when(documentRepository.findByTxHash("tx1")).thenReturn(Optional.empty());

        IdentityEventEntity identityEntity = IdentityEventEntity.builder()
                .txHash("tx1").sequenceNumber("0").dataHash("hash-abc").identifier("EAID1")
                .type("ATTEST").build();

        keriService.verifyIdentityTx(identityEntity);

        verify(reportRepository, never()).save(any());
        verify(documentRepository, never()).save(any());
        verifyNoInteractions(credentialRepository);
    }

    @Test
    void verifyIdentityTxVerifiesAndSavesAMatchingReport() {
        Coring.KeyEvents keyEvents = mock(Coring.KeyEvents.class);
        when(signifyClient.keyEvents()).thenReturn(keyEvents);
        mockKeyEventsGet(keyEvents, "EAID1", kelAnchoring("hash-abc"));

        KeriService keriService = service(Optional.of(signifyClient), true);
        ReportEntity report = ReportEntity.builder().id(1L).txHash("tx1")
                .metadataHash("hash-abc").organisationId("org-1").build();
        when(reportRepository.findByTxHash("tx1")).thenReturn(Optional.of(report));
        when(credentialRepository.findById("EAID1"))
                .thenReturn(Optional.of(CredentialEntity.builder().prefixId("EAID1").valid(true).build()));

        IdentityEventEntity identityEntity = IdentityEventEntity.builder()
                .txHash("tx1").sequenceNumber("0").dataHash("hash-abc").identifier("EAID1")
                .type("ATTEST").build();

        keriService.verifyIdentityTx(identityEntity);

        assertTrue(report.isIdentityVerified());
        assertEquals("EAID1", report.getIdentifier());
        verify(reportRepository).save(report);
    }

    @Test
    void verifyIdentityTxVerifiesAndSavesAMatchingDocumentWhenNoReportMatches() {
        Coring.KeyEvents keyEvents = mock(Coring.KeyEvents.class);
        when(signifyClient.keyEvents()).thenReturn(keyEvents);
        mockKeyEventsGet(keyEvents, "EAID1", kelAnchoring("hash-abc"));

        KeriService keriService = service(Optional.of(signifyClient), true);
        when(reportRepository.findByTxHash("tx1")).thenReturn(Optional.empty());
        DocumentEntity document = DocumentEntity.builder().txHash("tx1")
                .metadataHash("hash-abc").documentId("doc-1").organisationId("org-1").build();
        when(documentRepository.findByTxHash("tx1")).thenReturn(Optional.of(document));
        when(credentialRepository.findById("EAID1"))
                .thenReturn(Optional.of(CredentialEntity.builder().prefixId("EAID1").valid(true).build()));

        IdentityEventEntity identityEntity = IdentityEventEntity.builder()
                .txHash("tx1").sequenceNumber("0").dataHash("hash-abc").identifier("EAID1")
                .type("ATTEST").build();

        keriService.verifyIdentityTx(identityEntity);

        assertTrue(document.isIdentityVerified());
        assertEquals("EAID1", document.getIdentifier());
        verify(documentRepository).save(document);
    }

    @Test
    void verifyIdentityTxGateFailsAndDoesNotVerifyWhenCredentialIsMissing() {
        Coring.KeyEvents keyEvents = mock(Coring.KeyEvents.class);
        when(signifyClient.keyEvents()).thenReturn(keyEvents);
        mockKeyEventsGet(keyEvents, "EAID1", kelAnchoring("hash-abc"));

        KeriService keriService = service(Optional.of(signifyClient), true);
        ReportEntity report = ReportEntity.builder().id(1L).txHash("tx1")
                .metadataHash("hash-abc").organisationId("org-1").build();
        when(reportRepository.findByTxHash("tx1")).thenReturn(Optional.of(report));
        when(credentialRepository.findById("EAID1")).thenReturn(Optional.empty());

        IdentityEventEntity identityEntity = IdentityEventEntity.builder()
                .txHash("tx1").sequenceNumber("0").dataHash("hash-abc").identifier("EAID1")
                .type("ATTEST").build();

        keriService.verifyIdentityTx(identityEntity);

        assertFalse(report.isIdentityVerified());
        assertNull(report.getIdentifier());
        // The hash still matched, so the (unverified) row is still persisted.
        verify(reportRepository).save(report);
    }

    @Test
    void verifyIdentityTxGateFailsAndDoesNotVerifyWhenCredentialIsInvalid() {
        Coring.KeyEvents keyEvents = mock(Coring.KeyEvents.class);
        when(signifyClient.keyEvents()).thenReturn(keyEvents);
        mockKeyEventsGet(keyEvents, "EAID1", kelAnchoring("hash-abc"));

        KeriService keriService = service(Optional.of(signifyClient), true);
        ReportEntity report = ReportEntity.builder().id(1L).txHash("tx1")
                .metadataHash("hash-abc").organisationId("org-1").build();
        when(reportRepository.findByTxHash("tx1")).thenReturn(Optional.of(report));
        when(credentialRepository.findById("EAID1"))
                .thenReturn(Optional.of(CredentialEntity.builder().prefixId("EAID1").valid(false).build()));

        IdentityEventEntity identityEntity = IdentityEventEntity.builder()
                .txHash("tx1").sequenceNumber("0").dataHash("hash-abc").identifier("EAID1")
                .type("ATTEST").build();

        keriService.verifyIdentityTx(identityEntity);

        assertFalse(report.isIdentityVerified());
        verify(reportRepository).save(report);
    }

    /** {@code Coring.KeyEvents#get} is declared {@code throws Exception}, which forces the mocked
     *  stub setup into a checked-exception-safe helper. */
    private static void mockKeyEventsGet(Coring.KeyEvents keyEvents, String identifier, Object result) {
        try {
            when(keyEvents.get(identifier)).thenReturn(result);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
