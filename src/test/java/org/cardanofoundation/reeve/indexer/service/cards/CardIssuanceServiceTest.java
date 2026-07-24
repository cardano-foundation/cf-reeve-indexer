package org.cardanofoundation.reeve.indexer.service.cards;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.cardanofoundation.reeve.indexer.model.entity.IssuedCardEntity;
import org.cardanofoundation.reeve.indexer.model.repository.IssuedCardRepository;

class CardIssuanceServiceTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private IssuedCardRepository repository;
    private CardIssuanceService service;

    @BeforeEach
    void setUp() {
        repository = mock(IssuedCardRepository.class);
        when(repository.findBySubjectIdAndOrganisationIdAndPublicKey(any(), any(), any()))
                .thenReturn(Optional.empty());
        when(repository.findFirstBySubjectTypeAndOrganisationIdAndPublicKey(any(), any(), any()))
                .thenReturn(Optional.empty());
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        service = new CardIssuanceService(repository,
                Clock.fixed(Instant.parse("2026-07-14T10:15:30Z"), ZoneOffset.UTC),
                objectMapper, true);
    }

    private JsonNode request(String subjectType, String subjectId) throws Exception {
        return objectMapper.readTree("""
            {"subject":{"subjectType":"%s"%s,"displayName":"Bob","email":"bob@example.org",
             "organisationId":"75f95560"},
             "key":{"publicKey":"%s","label":"Bob's key"}}
            """.formatted(subjectType,
                subjectId == null ? "" : ",\"subjectId\":\"" + subjectId + "\"",
                "8f".repeat(32)));
    }

    @Test
    void issuesUnsignedCamelCaseCard() throws Exception {
        JsonNode card = service.issue(request("REEVE_ACCOUNT", "kc-sub-1"));

        assertEquals(1, card.get("v").asInt());
        assertEquals("REEVE_KEY_CARD", card.get("type").asText());
        assertEquals("REEVE_ACCOUNT", card.at("/subject/subjectType").asText());
        assertEquals("kc-sub-1", card.at("/subject/subjectId").asText());
        assertEquals("8f".repeat(32), card.at("/key/publicKey").asText());
        assertEquals("PORTABLE", card.at("/key/assurance").asText()); // default when unspecified
        assertEquals("2026-07-14T10:15:30Z", card.at("/key/createdAt").asText());
        verify(repository).save(any(IssuedCardEntity.class));
    }

    @Test
    void issuedCardCarriesNoIssuerAndNoSignatureAndNoPrivateKey() throws Exception {
        // The trust model is removed: an assembled card is UNSIGNED. There is no issuer object,
        // no signature, and (as always) no private key.
        JsonNode card = service.issue(request("EXTERNAL", null));

        assertFalse(card.has("issuer"), "card must carry no issuer object");
        assertFalse(card.has("signature"), "card must carry no signature");
        assertFalse(card.has("privateKey"), "the server never assembles private key material");
        assertFalse(card.at("/key").has("privateKey"));
    }

    @Test
    void issuesOrgLessCardWithEmptyOrganisation() throws Exception {
        // §9.4 org-less card: an EXTERNAL holder with no organisation. organisationId is optional
        // and stored/emitted as an empty string.
        JsonNode noOrg = objectMapper.readTree("""
            {"subject":{"subjectType":"EXTERNAL","displayName":"Auditor","email":"a@ext.org"},
             "key":{"publicKey":"%s","label":"audit key"}}
            """.formatted("8f".repeat(32)));

        JsonNode card = service.issue(noOrg);

        assertEquals("REEVE_KEY_CARD", card.get("type").asText());
        assertEquals("", card.at("/subject/organisationId").asText());
        assertFalse(card.has("signature"));
        verify(repository).save(any(IssuedCardEntity.class));
    }

    @Test
    void externalSubjectGetsMintedUuid() throws Exception {
        JsonNode card = service.issue(request("EXTERNAL", null));
        assertDoesNotThrow(() -> UUID.fromString(card.at("/subject/subjectId").asText()));
    }

    @Test
    void externalReissueWithSameKeyIsIdempotentAndDoesNotMintADuplicate() throws Exception {
        // The passkey-derived publicKey is deterministic, so a retry (double-click / timeout re-POST)
        // with the same (organisationId, publicKey) must return the ORIGINAL external card rather than
        // mint a second identity for the same holder key.
        IssuedCardEntity existing = IssuedCardEntity.builder()
                .cardId(UUID.randomUUID()).subjectType("EXTERNAL")
                .subjectId("existing-external-uuid").organisationId("75f95560")
                .publicKey("8f".repeat(32)).assurance("PASSKEY")
                .keyCreatedAt("2026-01-01T00:00:00Z").build();
        when(repository.findFirstBySubjectTypeAndOrganisationIdAndPublicKey(
                "EXTERNAL", "75f95560", "8f".repeat(32))).thenReturn(Optional.of(existing));

        JsonNode card = service.issue(request("EXTERNAL", null));

        assertEquals("existing-external-uuid", card.at("/subject/subjectId").asText());
        verify(repository, never()).save(any());
    }

    @Test
    void concurrentInsertRaceReturnsTheWinnersCardInsteadOf500() throws Exception {
        // The loser of a race: the read-then-insert check found nothing, but save() hits the EXTERNAL
        // partial unique index because a concurrent request inserted first. The service must re-read
        // and return the winner's card, not surface the constraint violation as a 500.
        IssuedCardEntity winner = IssuedCardEntity.builder()
                .cardId(UUID.randomUUID()).subjectType("EXTERNAL")
                .subjectId("winner-uuid").organisationId("75f95560")
                .publicKey("8f".repeat(32)).assurance("PASSKEY")
                .keyCreatedAt("2026-01-01T00:00:00Z").build();
        when(repository.save(any()))
                .thenThrow(new org.springframework.dao.DataIntegrityViolationException("uq"));
        // Pre-insert idempotency check returns empty; the post-race re-read returns the winner.
        when(repository.findFirstBySubjectTypeAndOrganisationIdAndPublicKey(
                "EXTERNAL", "75f95560", "8f".repeat(32)))
                .thenReturn(Optional.empty(), Optional.of(winner));

        JsonNode card = service.issue(request("EXTERNAL", null));

        assertEquals("winner-uuid", card.at("/subject/subjectId").asText());
    }

    @Test
    void overLongOrganisationIdIsRejectedBeforeSave() throws Exception {
        // organisation_id is varchar(64); an over-64 value must be a clean 400, not a 500 at save.
        JsonNode bad = objectMapper.readTree("""
            {"subject":{"subjectType":"EXTERNAL","organisationId":"%s"},
             "key":{"publicKey":"%s"}}
            """.formatted("o".repeat(65), "8f".repeat(32)));
        CardIssuanceService.CardIssuanceException e =
                assertThrows(CardIssuanceService.CardIssuanceException.class,
                        () -> service.issue(bad));
        assertEquals("INVALID_SUBJECT", e.getTitle());
        verify(repository, never()).save(any());
    }

    @Test
    void passkeyAssuranceIsHonoured() throws Exception {
        JsonNode req = objectMapper.readTree("""
            {"subject":{"subjectType":"EXTERNAL","organisationId":"75f95560"},
             "key":{"publicKey":"%s","label":"passkey device","assurance":"PASSKEY"}}
            """.formatted("8f".repeat(32)));

        JsonNode card = service.issue(req);

        assertEquals("PASSKEY", card.at("/key/assurance").asText());
    }

    @Test
    void invalidAssuranceIsRejected() throws Exception {
        JsonNode req = objectMapper.readTree("""
            {"subject":{"subjectType":"EXTERNAL","organisationId":"75f95560"},
             "key":{"publicKey":"%s","assurance":"SOMETHING"}}
            """.formatted("8f".repeat(32)));

        CardIssuanceService.CardIssuanceException e =
                assertThrows(CardIssuanceService.CardIssuanceException.class,
                        () -> service.issue(req));
        assertEquals("INVALID_ASSURANCE", e.getTitle());
    }

    @Test
    void reeveAccountWithoutSubjectIdIsRejected() {
        CardIssuanceService.CardIssuanceException e =
                assertThrows(CardIssuanceService.CardIssuanceException.class,
                        () -> service.issue(request("REEVE_ACCOUNT", null)));
        assertEquals("INVALID_SUBJECT", e.getTitle());
    }

    @Test
    void unknownSubjectTypeIsRejected() {
        CardIssuanceService.CardIssuanceException e =
                assertThrows(CardIssuanceService.CardIssuanceException.class,
                        () -> service.issue(request("SOMETHING", "x")));
        assertEquals("INVALID_SUBJECT", e.getTitle());
    }

    @Test
    void malformedPublicKeyIsRejected() throws Exception {
        JsonNode bad = objectMapper.readTree("""
            {"subject":{"subjectType":"EXTERNAL","displayName":"B","organisationId":"o"},
             "key":{"publicKey":"NOT-HEX","label":"l"}}
            """);
        CardIssuanceService.CardIssuanceException e =
                assertThrows(CardIssuanceService.CardIssuanceException.class,
                        () -> service.issue(bad));
        assertEquals("INVALID_PUBLIC_KEY", e.getTitle());
    }

    @Test
    void overLongDisplayNameIsRejected() throws Exception {
        JsonNode bad = objectMapper.readTree("""
            {"subject":{"subjectType":"EXTERNAL","organisationId":"o","displayName":"%s"},
             "key":{"publicKey":"%s"}}
            """.formatted("a".repeat(256), "8f".repeat(32)));
        CardIssuanceService.CardIssuanceException e =
                assertThrows(CardIssuanceService.CardIssuanceException.class,
                        () -> service.issue(bad));
        assertEquals("INVALID_SUBJECT", e.getTitle());
    }

    @Test
    void overLongLabelIsRejected() throws Exception {
        JsonNode bad = objectMapper.readTree("""
            {"subject":{"subjectType":"EXTERNAL","organisationId":"o"},
             "key":{"publicKey":"%s","label":"%s"}}
            """.formatted("8f".repeat(32), "l".repeat(256)));
        CardIssuanceService.CardIssuanceException e =
                assertThrows(CardIssuanceService.CardIssuanceException.class,
                        () -> service.issue(bad));
        assertEquals("INVALID_LABEL", e.getTitle());
    }

    @Test
    void malformedEmailIsRejected() throws Exception {
        JsonNode bad = objectMapper.readTree("""
            {"subject":{"subjectType":"EXTERNAL","organisationId":"o","email":"not-an-email"},
             "key":{"publicKey":"%s"}}
            """.formatted("8f".repeat(32)));
        CardIssuanceService.CardIssuanceException e =
                assertThrows(CardIssuanceService.CardIssuanceException.class,
                        () -> service.issue(bad));
        assertEquals("INVALID_EMAIL", e.getTitle());
    }

    @Test
    void overLongEmailIsRejected() throws Exception {
        // 316 local-part chars + "@e.io" (5) = 321 chars, one over the 320 bound.
        JsonNode bad = objectMapper.readTree("""
            {"subject":{"subjectType":"EXTERNAL","organisationId":"o","email":"%s"},
             "key":{"publicKey":"%s"}}
            """.formatted("a".repeat(316) + "@e.io", "8f".repeat(32)));
        CardIssuanceService.CardIssuanceException e =
                assertThrows(CardIssuanceService.CardIssuanceException.class,
                        () -> service.issue(bad));
        assertEquals("INVALID_EMAIL", e.getTitle());
    }

    @Test
    void smuggledPrivateKeyMaterialIsRejected() throws Exception {
        JsonNode bad = objectMapper.readTree("""
            {"subject":{"subjectType":"EXTERNAL","organisationId":"o"},
             "key":{"publicKey":"%s","label":"l",
                    "privateKey":{"wrapped":"deadbeef"}}}
            """.formatted("8f".repeat(32)));
        CardIssuanceService.CardIssuanceException e =
                assertThrows(CardIssuanceService.CardIssuanceException.class,
                        () -> service.issue(bad));
        assertEquals("CARD_CONTAINS_PRIVATE_KEY", e.getTitle());
    }

    @Test
    void smuggledPrivateKeyMaterialUnderSnakeCaseFieldNameIsRejected() throws Exception {
        JsonNode bad = objectMapper.readTree("""
            {"subject":{"subjectType":"EXTERNAL","organisationId":"o"},
             "key":{"publicKey":"%s","label":"l",
                    "private_key":{"wrapped":"deadbeef"}}}
            """.formatted("8f".repeat(32)));
        CardIssuanceService.CardIssuanceException e =
                assertThrows(CardIssuanceService.CardIssuanceException.class,
                        () -> service.issue(bad));
        assertEquals("CARD_CONTAINS_PRIVATE_KEY", e.getTitle());
    }

    @Test
    void smuggledRawPrivateKeyUnderPrivateKeyHexFieldIsRejected() throws Exception {
        // The frontend's raw-key property is literally `privateKeyHex`; a regressed client that
        // sends the raw key under that exact name must be rejected before assembly (I1/I5).
        JsonNode bad = objectMapper.readTree("""
            {"subject":{"subjectType":"EXTERNAL","organisationId":"o"},
             "key":{"publicKey":"%s","label":"l","privateKeyHex":"%s"}}
            """.formatted("8f".repeat(32), "11".repeat(32)));
        CardIssuanceService.CardIssuanceException e =
                assertThrows(CardIssuanceService.CardIssuanceException.class,
                        () -> service.issue(bad));
        assertEquals("CARD_CONTAINS_PRIVATE_KEY", e.getTitle());
    }

    @Test
    void smuggledPrivateKeyUnderKebabCaseFieldNameIsRejected() throws Exception {
        JsonNode bad = objectMapper.readTree("""
            {"subject":{"subjectType":"EXTERNAL","organisationId":"o"},
             "key":{"publicKey":"%s","label":"l","private-key":"%s"}}
            """.formatted("8f".repeat(32), "11".repeat(32)));
        CardIssuanceService.CardIssuanceException e =
                assertThrows(CardIssuanceService.CardIssuanceException.class,
                        () -> service.issue(bad));
        assertEquals("CARD_CONTAINS_PRIVATE_KEY", e.getTitle());
    }

    @Test
    void smuggledPrivateScalarUnderSeedFieldIsRejected() throws Exception {
        // In the passkey model the X25519 private scalar is `seed`; the strict allowlist must refuse
        // it even though the legacy denylist (private|privkey|wrapped) would not have named it.
        JsonNode bad = objectMapper.readTree("""
            {"subject":{"subjectType":"EXTERNAL","organisationId":"o"},
             "key":{"publicKey":"%s","seed":"%s"}}
            """.formatted("8f".repeat(32), "11".repeat(32)));
        CardIssuanceService.CardIssuanceException e =
                assertThrows(CardIssuanceService.CardIssuanceException.class,
                        () -> service.issue(bad));
        assertEquals("CARD_CONTAINS_PRIVATE_KEY", e.getTitle());
    }

    @Test
    void unexpectedRequestFieldIsRejectedByTheStrictAllowlist() throws Exception {
        // Any field outside the accepted shape is refused up front (I5), whatever it is named.
        JsonNode bad = objectMapper.readTree("""
            {"subject":{"subjectType":"EXTERNAL","organisationId":"o","scalar":"deadbeef"},
             "key":{"publicKey":"%s"}}
            """.formatted("8f".repeat(32)));
        CardIssuanceService.CardIssuanceException e =
                assertThrows(CardIssuanceService.CardIssuanceException.class,
                        () -> service.issue(bad));
        assertEquals("CARD_CONTAINS_PRIVATE_KEY", e.getTitle());
    }

    @Test
    void legitimateRequestWithPublicKeyFieldIsNotMistakenForPrivateKeyMaterial() throws Exception {
        JsonNode card = service.issue(request("EXTERNAL", null));
        assertEquals("REEVE_KEY_CARD", card.get("type").asText());
        assertTrue(card.get("key").has("publicKey"));
    }

    @Test
    void issuanceDisabledIsUnavailable() throws Exception {
        CardIssuanceService disabled = new CardIssuanceService(repository, Clock.systemUTC(),
                objectMapper, false);
        CardIssuanceService.CardIssuanceException e =
                assertThrows(CardIssuanceService.CardIssuanceException.class,
                        () -> disabled.issue(request("EXTERNAL", null)));
        assertEquals("CARD_ISSUANCE_UNAVAILABLE", e.getTitle());
        assertEquals(503, e.getStatus());
        assertFalse(disabled.isEnabled());
    }

    /** Builds a stored registry row (unsigned model — no issuer/signature). */
    private IssuedCardEntity existingEntity() {
        return IssuedCardEntity.builder()
                .cardId(UUID.randomUUID()).subjectType("REEVE_ACCOUNT")
                .subjectId("kc-sub-1").organisationId("75f95560")
                .publicKey("8f".repeat(32)).label("old label").assurance("PORTABLE")
                .keyCreatedAt("2026-01-01T00:00:00Z").build();
    }

    @Test
    void reissuingSameSubjectKeyIsIdempotent() throws Exception {
        // The same (subjectId, organisationId, publicKey) returns the stored row's card unchanged,
        // preserving its original key.createdAt rather than minting a new one.
        IssuedCardEntity existing = existingEntity();
        when(repository.findBySubjectIdAndOrganisationIdAndPublicKey("kc-sub-1", "75f95560",
                "8f".repeat(32))).thenReturn(Optional.of(existing));

        JsonNode card = service.issue(request("REEVE_ACCOUNT", "kc-sub-1"));

        assertEquals("2026-01-01T00:00:00Z", card.at("/key/createdAt").asText());
        assertFalse(card.has("signature"));
        verify(repository, never()).save(any());
    }

    @Test
    void absentOptionalFieldsAreOmittedFromJson() throws Exception {
        JsonNode request = objectMapper.readTree("""
            {"subject":{"subjectType":"EXTERNAL","organisationId":"75f95560"},
             "key":{"publicKey":"%s"}}
            """.formatted("8f".repeat(32)));

        JsonNode card = service.issue(request);

        assertFalse(card.at("/subject").has("displayName"));
        assertFalse(card.at("/subject").has("email"));
        assertFalse(card.at("/key").has("label"));
    }

    @Test
    void cardJsonSurvivesGlobalSnakeCaseMapperUnrenamed() throws Exception {
        // The card is a hand-built ObjectNode, not a POJO, so the app's global SNAKE_CASE mapper
        // cannot rename its camelCase fields when re-serializing it.
        JsonNode card = service.issue(request("EXTERNAL", null));

        ObjectMapper snakeCaseMapper = new ObjectMapper()
                .setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE);
        String json = snakeCaseMapper.writeValueAsString(card);

        assertTrue(json.contains("\"subjectType\""));
        assertTrue(json.contains("\"publicKey\""));
        assertTrue(json.contains("\"createdAt\""));
        assertFalse(json.contains("\"subject_type\""));
        assertFalse(json.contains("\"public_key\""));
        assertFalse(json.contains("\"created_at\""));
    }

    @Test
    void exportCardForUnknownCardIdIsEmpty() {
        UUID cardId = UUID.randomUUID();
        when(repository.findById(cardId)).thenReturn(Optional.empty());

        assertTrue(service.exportCard(cardId).isEmpty());
    }

    @Test
    void exportCardForKnownCardIdReturnsTheCard() {
        IssuedCardEntity existing = existingEntity();
        when(repository.findById(existing.getCardId())).thenReturn(Optional.of(existing));

        Optional<JsonNode> card = service.exportCard(existing.getCardId());

        assertTrue(card.isPresent());
        assertEquals("REEVE_KEY_CARD", card.get().get("type").asText());
        assertFalse(card.get().has("signature"));
        assertEquals("2026-01-01T00:00:00Z", card.get().at("/key/createdAt").asText());
    }

    @Test
    void exportedCardEmitsFullAttestationBlockIncludingCredentialCesr() {
        // The producer contract the platform's B2 import verification consumes: an attested card's
        // exported JSON carries every attestation field, INCLUDING the full CESR credential chain the
        // importer needs to re-validate the credential itself (it cannot fetch it via the OOBI alone).
        IssuedCardEntity attested = existingEntity();
        attested.setAttestationOobi("https://wallet.example/oobi/EWalletAid/agent/EAgentEid");
        attested.setAttestationAid("EWalletAid");
        attested.setAttestationCredentialSaid("ECredentialSaid");
        attested.setAttestationSchemaSaid("ESchemaSaid");
        attested.setAttestationTxHash("deadbeef");
        attested.setAttestationCredentialCesr("-CESR-credential-chain-");
        when(repository.findById(attested.getCardId())).thenReturn(Optional.of(attested));

        JsonNode card = service.exportCard(attested.getCardId()).orElseThrow();

        assertEquals("https://wallet.example/oobi/EWalletAid/agent/EAgentEid",
                card.at("/attestation/oobi").asText());
        assertEquals("EWalletAid", card.at("/attestation/aid").asText());
        assertEquals("ECredentialSaid", card.at("/attestation/credentialSaid").asText());
        assertEquals("ESchemaSaid", card.at("/attestation/schemaSaid").asText());
        assertEquals("deadbeef", card.at("/attestation/txHash").asText());
        assertEquals("-CESR-credential-chain-", card.at("/attestation/credentialCesr").asText());
    }

    @Test
    void unattestedCardOmitsTheAttestationBlockEntirely() {
        // An issued-but-unattested card (all attestation_* null) must omit the block so its wire
        // format stays byte-identical to a pre-ceremony card.
        IssuedCardEntity unattested = existingEntity();
        when(repository.findById(unattested.getCardId())).thenReturn(Optional.of(unattested));

        JsonNode card = service.exportCard(unattested.getCardId()).orElseThrow();

        assertFalse(card.has("attestation"));
    }

    // --- issueEntityFromCard: register a full client-built card so a ceremony can attest it (Option B) ---

    @Test
    void issueEntityFromCardRegistersAClientBuiltCardAndReturnsItsCardId() throws Exception {
        // The attest wizard's first step: a card the browser built entirely client-side (no server
        // cardId) is registered here so a ceremony can be opened against the row's cardId. The
        // holder's public key must survive verbatim; createdAt is re-minted server-side.
        JsonNode fullCard = objectMapper.readTree("""
            {"v":1,"type":"REEVE_KEY_CARD",
             "subject":{"subjectType":"EXTERNAL","subjectId":"client-minted-uuid","displayName":"Bob",
                        "email":"bob@example.org","organisationId":"75f95560"},
             "key":{"publicKey":"%s","label":"Bob's key","assurance":"PASSKEY",
                    "createdAt":"2026-01-01T00:00:00Z"}}
            """.formatted("8f".repeat(32)));

        IssuedCardEntity entity = service.issueEntityFromCard(fullCard);

        assertNotNull(entity.getCardId());
        assertEquals("8f".repeat(32), entity.getPublicKey());
        assertEquals("EXTERNAL", entity.getSubjectType());
        assertEquals("PASSKEY", entity.getAssurance());
        verify(repository).save(any(IssuedCardEntity.class));
    }

    @Test
    void issueEntityFromCardRejectsSmuggledPrivateKeyMaterial() throws Exception {
        // The card is validated through issueEntity's SAME allowlist/private-key rejection as /issue:
        // dropping the (legitimate) createdAt must NOT open a hole for a smuggled `seed` beside it.
        JsonNode fullCard = objectMapper.readTree("""
            {"v":1,"type":"REEVE_KEY_CARD",
             "subject":{"subjectType":"EXTERNAL","organisationId":"o"},
             "key":{"publicKey":"%s","seed":"%s","createdAt":"2026-01-01T00:00:00Z"}}
            """.formatted("8f".repeat(32), "11".repeat(32)));

        CardIssuanceService.CardIssuanceException e =
                assertThrows(CardIssuanceService.CardIssuanceException.class,
                        () -> service.issueEntityFromCard(fullCard));
        assertEquals("CARD_CONTAINS_PRIVATE_KEY", e.getTitle());
        verify(repository, never()).save(any());
    }

    @Test
    void issueEntityFromCardRejectsUnsupportedVersionOrType() throws Exception {
        JsonNode badVersion = objectMapper.readTree("""
            {"v":2,"type":"REEVE_KEY_CARD",
             "subject":{"subjectType":"EXTERNAL","organisationId":"o"},"key":{"publicKey":"%s"}}
            """.formatted("8f".repeat(32)));
        JsonNode badType = objectMapper.readTree("""
            {"v":1,"type":"SOMETHING_ELSE",
             "subject":{"subjectType":"EXTERNAL","organisationId":"o"},"key":{"publicKey":"%s"}}
            """.formatted("8f".repeat(32)));

        assertEquals("INVALID_CARD", assertThrows(CardIssuanceService.CardIssuanceException.class,
                () -> service.issueEntityFromCard(badVersion)).getTitle());
        assertEquals("INVALID_CARD", assertThrows(CardIssuanceService.CardIssuanceException.class,
                () -> service.issueEntityFromCard(badType)).getTitle());
        verify(repository, never()).save(any());
    }

    @Test
    void issueEntityFromCardIsIdempotentOnHolderKey() throws Exception {
        // Registering the same holder key twice (e.g. opening a second ceremony) must return the SAME
        // row, not mint a duplicate identity — idempotent exactly as /issue is.
        IssuedCardEntity existing = IssuedCardEntity.builder()
                .cardId(UUID.randomUUID()).subjectType("EXTERNAL")
                .subjectId("existing-uuid").organisationId("75f95560")
                .publicKey("8f".repeat(32)).assurance("PASSKEY")
                .keyCreatedAt("2026-01-01T00:00:00Z").build();
        when(repository.findFirstBySubjectTypeAndOrganisationIdAndPublicKey(
                "EXTERNAL", "75f95560", "8f".repeat(32))).thenReturn(Optional.of(existing));

        JsonNode fullCard = objectMapper.readTree("""
            {"v":1,"type":"REEVE_KEY_CARD",
             "subject":{"subjectType":"EXTERNAL","organisationId":"75f95560"},
             "key":{"publicKey":"%s","createdAt":"2026-05-05T00:00:00Z"}}
            """.formatted("8f".repeat(32)));

        IssuedCardEntity entity = service.issueEntityFromCard(fullCard);

        assertEquals(existing.getCardId(), entity.getCardId());
        verify(repository, never()).save(any());
    }
}
