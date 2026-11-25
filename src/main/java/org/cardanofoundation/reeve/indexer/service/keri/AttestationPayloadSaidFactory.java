package org.cardanofoundation.reeve.indexer.service.keri;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import org.cardanofoundation.reeve.indexer.service.card.attestation.RemotesignRequestFactory;

/**
 * Recomputes the SAID a Veridian wallet seals when it attests a published label-1447 payload, so a
 * wallet-driven ATTEST can be correlated with what it authorises.
 *
 * <p><b>Why the raw metadata hash is not enough.</b> The backend-driven path anchors the digest of the
 * published manifest directly, which is why {@code metadataHash} can be compared against the ATTEST's
 * {@code d} as-is. A wallet cannot: a remotesign request has to be self-addressing, so the digest is
 * wrapped in a payload and it is that PAYLOAD's SAID — not the digest — that the wallet seals and the
 * publisher writes to {@code 170.d}. The wrapper is not decorative; a Veridian wallet silently drops a
 * request that is not self-addressing. So the two contracts differ by exactly one wrapping step, and
 * this class is that step.
 *
 * <p>It takes the on-chain metadata hash and nothing else. There used to be a whole parallel
 * "commitment" structure here — the document's identity fields, hashes and recipient set, mirrored
 * put-for-put against the platform — because the manifest carried {@code creation_slot},
 * {@code timestamp} and {@code ipfs_cid}, none of which a wallet could know before publication. All
 * three are now derivable at attesting time (the first two were dropped from the DOCUMENT manifest,
 * and the CID is computed from the envelope bytes rather than taken from the pin), so the wallet
 * attests the real manifest and the indexer needs no mirror of it at all. Do not reintroduce one: a
 * mirrored structure is a second copy of a wire format that silently stops matching the moment either
 * side edits a field.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AttestationPayloadSaidFactory {

    private final RemotesignRequestFactory remotesignRequestFactory;

    /** The label the attested value is published under; an input to the anchored SAID. */
    @Value("${reeve.metadata.label:1447}")
    private String reeveMetadataLabel;

    /**
     * @param metadataHash the Blake3-256 qb64 digest of the label-1447 payload, as indexed off chain
     *                     ({@code ReeveMetadataStorage}) — the same value the attesting side digested.
     * @return the SAID the attesting wallet is expected to have sealed, or {@code null} when it cannot
     *         be derived. A null is "cannot say", never "does not match": the caller must not read it
     *         as a failed attestation.
     */
    public String expectedPayloadSaid(String metadataHash, String walletAid) {
        if (metadataHash == null || walletAid == null) {
            return null;
        }
        try {
            return (String) remotesignRequestFactory
                    .anchorRequestKed(walletAid, reeveMetadataLabel, metadataHash)
                    .get("d");
        } catch (RuntimeException e) {
            log.warn("Could not derive the expected attestation payload SAID for metadata hash {}: {}",
                    metadataHash, e.getMessage());
            return null;
        }
    }
}
