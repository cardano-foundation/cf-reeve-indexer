package org.cardanofoundation.reeve.indexer.service.keri;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.springframework.test.util.ReflectionTestUtils;

import org.junit.jupiter.api.Test;

import org.cardanofoundation.reeve.indexer.service.card.attestation.RemotesignRequestFactory;

/**
 * Pins the one derivation standing between the on-chain metadata hash and what a wallet seals.
 *
 * <p>The platform wraps the very same value with a byte-identical {@code RemotesignRequestFactory}
 * before asking the wallet to sign it, so agreeing here is agreeing with the platform. What used to sit
 * in this position was a mirrored copy of the whole commitment structure — ten fields that had to stay
 * in the same order as the platform's, forever. There is nothing left to mirror.
 */
class AttestationPayloadSaidFactoryTest {

    private static final String WALLET_AID = "EJ7F9XqvE0e1Sv8kX2nQ4bT6yZ3wR5uL8mN0pC1dG2hI";
    private static final String METADATA_HASH = "EAP5Az_lZU2xTS5C--pHFMd7VeyCpqpl8572CfgDoFXC";

    private AttestationPayloadSaidFactory factory(String label) {
        AttestationPayloadSaidFactory factory = new AttestationPayloadSaidFactory(new RemotesignRequestFactory());
        ReflectionTestUtils.setField(factory, "reeveMetadataLabel", label);

        return factory;
    }

    @Test
    void wrapsTheMetadataHashInTheRemotesignPayloadAndReturnsItsSaid() {
        String said = factory("1447").expectedPayloadSaid(METADATA_HASH, WALLET_AID);

        // Self-addressing: the wallet recomputes this over the payload it receives, so it must be the
        // payload's own SAID and not the metadata hash that went into it.
        assertNotEquals(METADATA_HASH, said);
        assertEquals(new RemotesignRequestFactory()
                .anchorRequestKed(WALLET_AID, "1447", METADATA_HASH).get("d"), said);
    }

    @Test
    void everyInputChangesTheSaid() {
        String baseline = factory("1447").expectedPayloadSaid(METADATA_HASH, WALLET_AID);

        // The label is part of the anchored payload: the same digest published under a different label
        // is a different attestation.
        assertNotEquals(baseline, factory("170").expectedPayloadSaid(METADATA_HASH, WALLET_AID));
        // A different wallet cannot inherit another's attestation.
        assertNotEquals(baseline, factory("1447").expectedPayloadSaid(METADATA_HASH, "EOTHERWALLETAID"));
        // And a different manifest digests differently, so it wraps differently.
        assertNotEquals(baseline, factory("1447").expectedPayloadSaid("EDIFFERENTMETADATAHASH", WALLET_AID));
    }

    @Test
    void yieldsNothingWithoutAMetadataHashOrAnAttestingAid() {
        // Null is "cannot say", never "does not match" — the caller must not treat it as a rejection.
        assertNull(factory("1447").expectedPayloadSaid(null, WALLET_AID));
        assertNull(factory("1447").expectedPayloadSaid(METADATA_HASH, null));
    }
}
