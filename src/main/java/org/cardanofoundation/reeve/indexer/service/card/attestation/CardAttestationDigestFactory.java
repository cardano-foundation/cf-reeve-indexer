package org.cardanofoundation.reeve.indexer.service.card.attestation;

import java.math.BigInteger;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import com.bloxbean.cardano.client.metadata.MetadataBuilder;
import com.bloxbean.cardano.client.metadata.MetadataMap;

import org.cardanofoundation.reeve.indexer.model.entity.IssuedCardEntity;
import org.cardanofoundation.reeve.indexer.service.card.issuance.CardIssuanceService;

/**
 * Computes the CIP-170 attestation digest for an issued card — the single canonical value sent to the
 * paired Veridian wallet (wrapped by {@link RemotesignRequestFactory}) for the wallet to anchor in
 * its own KEL via remotesign. Nothing publishes it on-chain: the KEL anchor IS the attestation (see
 * {@code CardAttestService}'s javadoc).
 *
 * <h2>THE EXACT FORMULA must stay stable, since any importer verifying an attested card must
 * recompute this SAME value from the card file, re-derive the payload SAID from it ({@link
 * RemotesignRequestFactory}), and check that the attesting AID's KEL event seals that SAID. Changing
 * this formula breaks every verifier that depends on it.</h2>
 *
 * The Blake3-256 {@code Diger} qb64 digest ({@link Cip170MetadataFactory#digestOf}) of the CANONICAL
 * CBOR encoding of a {@link MetadataMap} built from the card's own REEVE_KEY_CARD JSON ({@link
 * CardIssuanceService#toCardJson}) <b>MINUS the {@code attestation} block</b> — i.e. exactly the
 * fields the card carries BEFORE it is attested, with the SAME "omit if blank" rule {@code
 * toCardJson} itself applies (mirroring its {@code putIfPresent}):
 *
 * <pre>
 * {
 *   v: 1,                                    // CardIssuanceService.CARD_VERSION
 *   type: "REEVE_KEY_CARD",                  // CardIssuanceService.CARD_TYPE
 *   subject: {
 *     subjectType, subjectId,                // always present
 *     [displayName], [email],                // OMITTED if null/blank
 *     organisationId                          // always present (empty string, never omitted/null)
 *   },
 *   key: {
 *     publicKey,                              // always present
 *     [label],                                // OMITTED if null/blank
 *     assurance, createdAt                    // always present
 *   }
 * }
 * </pre>
 *
 * <p>Field INSERTION ORDER does not matter for the resulting digest: {@code
 * CborSerializationUtil}'s canonical CBOR serialization sorts map keys deterministically ({@link
 * Cip170MetadataFactory}'s own javadoc) — so an importer rebuilding this same map from the card JSON
 * it received gets a byte-identical digest regardless of how it walks the JSON.
 *
 * <p>Why "the whole card minus attestation" rather than a narrower {@code {cardId, publicKey,
 * subjectId}} triple: {@code toCardJson} never emits {@code cardId} at all (the export is
 * intentionally minimal/public-only) — an importer only ever has the fields above to work with, so
 * the digest must be computable from exactly those and nothing else.
 */
@Service
@RequiredArgsConstructor
public class CardAttestationDigestFactory {

    private final Cip170MetadataFactory metadataFactory;

    /** @return the card's canonical attestation digest (qb64, CESR-prefixed) — see this class's own
     *          javadoc for the exact formula. */
    public String digestOf(IssuedCardEntity card) {
        return metadataFactory.digestOf(cardMetadataMap(card));
    }

    // --- internals: mirrors CardIssuanceService#toCardJson's field inclusion, MetadataMap-shaped ---

    private static MetadataMap cardMetadataMap(IssuedCardEntity card) {
        MetadataMap root = MetadataBuilder.createMap();
        root.put("v", BigInteger.valueOf(CardIssuanceService.CARD_VERSION));
        root.put("type", CardIssuanceService.CARD_TYPE);

        MetadataMap subject = MetadataBuilder.createMap();
        subject.put("subjectType", card.getSubjectType());
        subject.put("subjectId", card.getSubjectId());
        putIfPresent(subject, "displayName", card.getDisplayName());
        putIfPresent(subject, "email", card.getEmail());
        subject.put("organisationId", card.getOrganisationId());
        root.put("subject", subject);

        MetadataMap key = MetadataBuilder.createMap();
        key.put("publicKey", card.getPublicKey());
        putIfPresent(key, "label", card.getLabel());
        key.put("assurance", card.getAssurance());
        key.put("createdAt", card.getKeyCreatedAt());
        root.put("key", key);

        return root;
    }

    private static void putIfPresent(MetadataMap map, String field, String value) {
        if (value != null && !value.isBlank()) {
            map.put(field, value);
        }
    }
}
