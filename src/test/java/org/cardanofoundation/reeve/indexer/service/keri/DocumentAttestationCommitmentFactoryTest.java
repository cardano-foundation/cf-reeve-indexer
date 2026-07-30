package org.cardanofoundation.reeve.indexer.service.keri;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.util.List;

import org.springframework.test.util.ReflectionTestUtils;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.cardanofoundation.reeve.indexer.model.entity.DocumentEntity;
import org.cardanofoundation.reeve.indexer.service.card.attestation.Cip170MetadataFactory;
import org.cardanofoundation.reeve.indexer.service.card.attestation.RemotesignRequestFactory;

/**
 * Cross-system contract with the publishing platform.
 *
 * <p>The expected SAID below was produced by the PLATFORM's own
 * {@code DocumentAttestationCommitment} + {@code Cip170MetadataFactory} + remotesign payload, for the
 * fixture built here. That is the whole point: a fixture computed on this side would agree with this
 * side no matter how wrong both were. If this test fails, the two implementations of the commitment
 * have diverged and every wallet-attested document will silently stop correlating.
 */
class DocumentAttestationCommitmentFactoryTest {

    private static final String WALLET_AID = "EWalletAid0000000000000000000000000000000";

    /** Pinned from the platform for the fixture below. Do not recompute it from this side. */
    private static final String PLATFORM_PAYLOAD_SAID = "EAP5Az_lZU2xTS5C--pHFMd7VeyCpqpl8572CfgDoFXC";

    private DocumentAttestationCommitmentFactory factory;

    @BeforeEach
    void setUp() {
        factory = new DocumentAttestationCommitmentFactory(
                new Cip170MetadataFactory(), new RemotesignRequestFactory());
        ReflectionTestUtils.setField(factory, "reeveMetadataLabel", "1447");
    }

    private static DocumentEntity document() {
        DocumentEntity document = new DocumentEntity();
        document.setTxHash("tx-1");
        document.setOrganisationId("org-1");
        document.setDocumentId("doc-1");
        document.setEnvelopeVersion(1);
        document.setContentHash("c".repeat(64));
        document.setPlaintextHash("p".repeat(64));
        document.setEnvelopeSha256("e".repeat(64));
        document.setRecipientKeyHashes(List.of("a".repeat(64), "b".repeat(64)));
        return document;
    }

    @Test
    void derivesTheSamePayloadSaidThePlatformAnchored() {
        assertEquals(PLATFORM_PAYLOAD_SAID, factory.expectedPayloadSaid(document(), WALLET_AID));
    }

    /**
     * The envelope hash is the one commitment input that is not on chain. Until the envelope is
     * fetched the answer must be "cannot say" — a null the caller treats as "not correlated yet" —
     * never a value that would be compared and found not to match.
     */
    @Test
    void yieldsNothingUntilTheEnvelopeHasBeenFetched() {
        DocumentEntity notYetFetched = document();
        notYetFetched.setEnvelopeSha256(null);

        assertNull(factory.expectedPayloadSaid(notYetFetched, WALLET_AID));
    }

    @Test
    void yieldsNothingWithoutAnAttestingAid() {
        assertNull(factory.expectedPayloadSaid(document(), null));
    }

    /** An incomplete manifest must not produce a confident-looking digest over partial data. */
    @Test
    void yieldsNothingWhenTheManifestIsMissingACoveredField() {
        DocumentEntity incomplete = document();
        incomplete.setPlaintextHash(null);

        assertNull(factory.expectedPayloadSaid(incomplete, WALLET_AID));
    }

    /** Every covered field is actually covered: changing any one changes the SAID. */
    @Test
    void anyChangeToACoveredFieldChangesTheSaid() {
        DocumentEntity other = document();
        other.setContentHash("d".repeat(64));
        assertNotEquals(PLATFORM_PAYLOAD_SAID, factory.expectedPayloadSaid(other, WALLET_AID));

        DocumentEntity reordered = document();
        reordered.setRecipientKeyHashes(List.of("b".repeat(64), "a".repeat(64)));
        assertNotEquals(PLATFORM_PAYLOAD_SAID, factory.expectedPayloadSaid(reordered, WALLET_AID),
                "recipient order is part of the commitment and must not be sorted away");
    }

    /** The label is an input to the SAID, so a deployment on another label derives a different one. */
    @Test
    void theMetadataLabelIsPartOfTheAnchoredSaid() {
        ReflectionTestUtils.setField(factory, "reeveMetadataLabel", "170");

        assertNotEquals(PLATFORM_PAYLOAD_SAID, factory.expectedPayloadSaid(document(), WALLET_AID));
    }
}
