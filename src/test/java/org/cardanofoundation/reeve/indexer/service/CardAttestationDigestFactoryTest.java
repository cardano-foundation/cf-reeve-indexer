package org.cardanofoundation.reeve.indexer.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigInteger;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

import com.bloxbean.cardano.client.metadata.MetadataBuilder;
import com.bloxbean.cardano.client.metadata.MetadataMap;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;

import org.cardanofoundation.reeve.indexer.model.entity.IssuedCardEntity;
import org.cardanofoundation.reeve.indexer.service.cards.CardIssuanceService;

/**
 * Contract test for {@link CardAttestationDigestFactory} (design doc Part A / A5) — the platform's
 * future B2 import verification recomputes this SAME digest from an imported card file, so this
 * formula must never change silently. See {@link CardAttestationDigestFactory}'s own javadoc for the
 * formula this pins.
 */
class CardAttestationDigestFactoryTest {

    private final Cip170MetadataFactory metadataFactory = new Cip170MetadataFactory();
    private final CardAttestationDigestFactory digestFactory = new CardAttestationDigestFactory(metadataFactory);
    private final CardIssuanceService cardIssuanceService = new CardIssuanceService(null,
            Clock.fixed(Instant.parse("2026-07-14T10:15:30Z"), ZoneOffset.UTC), new ObjectMapper(), true);

    // --- (a) golden vector: a fixed card must always produce this exact digest ---

    @Test
    void digestOfIsAStableGoldenVectorForAFixedCard() {
        IssuedCardEntity card = fullEntity();

        String digest = digestFactory.digestOf(card);

        // Pinned by running this test once against the current, reviewed formula (fixed entity above,
        // Cip170MetadataFactory.digestOf's Blake3-256 Diger qb64 over canonical CBOR). ANY change to
        // this literal means the formula changed — cross-check against the platform's B2 verification
        // before updating it.
        assertEquals("EGOZMuqWYxA-3YhsxIjiSGRtXBrMxtMDTrKNCmOt-7C9", digest);
        assertTrue(digest.startsWith("E"), "Blake3-256 CESR digests start with 'E'");
    }

    // --- (b) the digested field set must exactly match toCardJson MINUS attestation ---

    @Test
    void toCardJsonFieldSetWithAllOptionalFieldsPresentMatchesExactlyWhatTheDigestCovers() {
        // "Full" entity: displayName/email/label all present, PLUS the card is already attested (the
        // attestation block must still be excluded from the digest regardless of whether it happens to
        // be populated on the row when digestOf is called).
        IssuedCardEntity card = fullEntity();
        card.setAttestationOobi("https://example.org/oobi/EAID/agent/EEID");
        card.setAttestationAid("EAID");
        card.setAttestationCredentialSaid("ECRED");
        card.setAttestationSchemaSaid("ESCHEMA");
        card.setAttestationTxHash("deadbeef");

        JsonNode cardJson = cardIssuanceService.toCardJson(card);
        assertTrue(cardJson.has("attestation"), "test setup: the card must actually carry an attestation block");

        // toCardJson's own top-level field set, minus "attestation" (the digest formula's explicit
        // exclusion) — if a future field is ever added to toCardJson, this fails and flags that
        // CardAttestationDigestFactory's formula needs a matching review.
        assertEquals(Set.of("v", "type", "subject", "key"), fieldSetExcluding(cardJson, "attestation"));
        assertEquals(Set.of("subjectType", "subjectId", "displayName", "email", "organisationId"),
                fieldSet(cardJson.get("subject")));
        assertEquals(Set.of("publicKey", "label", "assurance", "createdAt"), fieldSet(cardJson.get("key")));

        // Cross-reconstruction: a digest computed by independently walking toCardJson's own output
        // (minus attestation) must equal the digest CardAttestationDigestFactory computes directly off
        // the entity — proving the two representations agree, not just that their field NAMES match.
        String digestFromEntity = digestFactory.digestOf(card);
        String digestFromCardJson = metadataFactory.digestOf(toMetadataMapExcludingAttestation(cardJson));
        assertEquals(digestFromCardJson, digestFromEntity);
    }

    @Test
    void toCardJsonFieldSetWithNoOptionalFieldsPresentOmitsThemFromWhatTheDigestCovers() {
        // Same putIfPresent omission rule toCardJson itself applies: displayName/email/label are
        // OMITTED entirely when blank; organisationId is ALWAYS present (even "", never omitted).
        IssuedCardEntity card = minimalEntity();

        JsonNode cardJson = cardIssuanceService.toCardJson(card);

        assertEquals(Set.of("subjectType", "subjectId", "organisationId"), fieldSet(cardJson.get("subject")));
        assertEquals(Set.of("publicKey", "assurance", "createdAt"), fieldSet(cardJson.get("key")));
        assertEquals("", cardJson.at("/subject/organisationId").asText(), "organisationId must never be omitted");

        String digestFromEntity = digestFactory.digestOf(card);
        String digestFromCardJson = metadataFactory.digestOf(toMetadataMapExcludingAttestation(cardJson));
        assertEquals(digestFromCardJson, digestFromEntity);
    }

    // --- every covered field actually affects the digest (not just structurally present) ---

    @Test
    void changingAnyCoveredFieldChangesTheDigest() {
        String baseDigest = digestFactory.digestOf(fullEntity());

        IssuedCardEntity differentPublicKey = fullEntity();
        differentPublicKey.setPublicKey("b".repeat(64));
        assertNotEquals(baseDigest, digestFactory.digestOf(differentPublicKey));

        IssuedCardEntity differentSubjectId = fullEntity();
        differentSubjectId.setSubjectId("different-subject");
        assertNotEquals(baseDigest, digestFactory.digestOf(differentSubjectId));

        IssuedCardEntity differentOrganisationId = fullEntity();
        differentOrganisationId.setOrganisationId("different-org");
        assertNotEquals(baseDigest, digestFactory.digestOf(differentOrganisationId));

        IssuedCardEntity differentDisplayName = fullEntity();
        differentDisplayName.setDisplayName("Someone Else");
        assertNotEquals(baseDigest, digestFactory.digestOf(differentDisplayName));
    }

    @Test
    void attestationFieldsOnTheCardRowDoNotAffectTheDigest() {
        // The digest is computed BEFORE the ceremony binds attestation onto the card, but must stay
        // stable even if called again afterward (e.g. a hypothetical re-verification) — attestation_*
        // columns are never part of the formula.
        IssuedCardEntity unattested = fullEntity();
        String unattestedDigest = digestFactory.digestOf(unattested);

        IssuedCardEntity attested = fullEntity();
        attested.setAttestationOobi("https://example.org/oobi/EAID/agent/EEID");
        attested.setAttestationAid("EAID");
        attested.setAttestationCredentialSaid("ECRED");
        attested.setAttestationSchemaSaid("ESCHEMA");
        attested.setAttestationTxHash("deadbeef");

        assertEquals(unattestedDigest, digestFactory.digestOf(attested));
    }

    // --- fixtures ---

    private static IssuedCardEntity fullEntity() {
        return IssuedCardEntity.builder()
                .cardId(UUID.fromString("11111111-1111-1111-1111-111111111111"))
                .subjectType("REEVE_ACCOUNT").subjectId("kc-sub-1")
                .displayName("Bob Example").email("bob@example.org")
                .organisationId("75f95560")
                .publicKey("8f".repeat(32)).label("Bob's key").assurance("PORTABLE")
                .keyCreatedAt("2026-01-01T00:00:00Z")
                .build();
    }

    private static IssuedCardEntity minimalEntity() {
        return IssuedCardEntity.builder()
                .cardId(UUID.fromString("22222222-2222-2222-2222-222222222222"))
                .subjectType("EXTERNAL").subjectId("ext-1")
                .organisationId("")
                .publicKey("8f".repeat(32)).assurance("PASSKEY")
                .keyCreatedAt("2026-01-01T00:00:00Z")
                .build();
    }

    // --- an INDEPENDENT (from CardAttestationDigestFactory's own internals) JSON -> MetadataMap walk ---

    /** Independently reconstructs the {@link MetadataMap} {@link CardAttestationDigestFactory} ought
     *  to have built for {@code card} — by walking {@code CardIssuanceService#toCardJson}'s own output
     *  instead of the entity directly, and explicitly never touching {@code "attestation"} — so the
     *  cross-reconstruction tests above are checking two independent code paths, not the digest factory
     *  against itself. */
    private static MetadataMap toMetadataMapExcludingAttestation(JsonNode card) {
        MetadataMap root = MetadataBuilder.createMap();
        root.put("v", BigInteger.valueOf(card.get("v").asInt()));
        root.put("type", card.get("type").asText());

        JsonNode subjectNode = card.get("subject");
        MetadataMap subject = MetadataBuilder.createMap();
        subject.put("subjectType", subjectNode.get("subjectType").asText());
        subject.put("subjectId", subjectNode.get("subjectId").asText());
        putIfPresent(subject, subjectNode, "displayName");
        putIfPresent(subject, subjectNode, "email");
        subject.put("organisationId", subjectNode.get("organisationId").asText());
        root.put("subject", subject);

        JsonNode keyNode = card.get("key");
        MetadataMap key = MetadataBuilder.createMap();
        key.put("publicKey", keyNode.get("publicKey").asText());
        putIfPresent(key, keyNode, "label");
        key.put("assurance", keyNode.get("assurance").asText());
        key.put("createdAt", keyNode.get("createdAt").asText());
        root.put("key", key);

        // "attestation" deliberately never read here — this IS the "minus attestation" assertion.
        return root;
    }

    private static void putIfPresent(MetadataMap map, JsonNode node, String field) {
        if (node.has(field)) {
            map.put(field, node.get(field).asText());
        }
    }

    private static Set<String> fieldSet(JsonNode node) {
        Set<String> fields = new LinkedHashSet<>();
        for (Iterator<String> it = node.fieldNames(); it.hasNext(); ) {
            fields.add(it.next());
        }
        return fields;
    }

    private static Set<String> fieldSetExcluding(JsonNode node, String excluded) {
        Set<String> fields = fieldSet(node);
        fields.remove(excluded);
        return fields;
    }
}
