package org.cardanofoundation.reeve.indexer.service.keri;

import java.math.BigInteger;
import java.util.List;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.bloxbean.cardano.client.metadata.MetadataBuilder;
import com.bloxbean.cardano.client.metadata.MetadataList;
import com.bloxbean.cardano.client.metadata.MetadataMap;

import org.cardanofoundation.reeve.indexer.model.entity.DocumentEntity;
import org.cardanofoundation.reeve.indexer.service.card.attestation.Cip170MetadataFactory;
import org.cardanofoundation.reeve.indexer.service.card.attestation.RemotesignRequestFactory;

/**
 * Recomputes what a Veridian wallet actually attested for a published document, so a wallet-driven
 * ATTEST can be correlated with the document it authorises.
 *
 * <p><b>Why this is not just the label-1447 digest.</b> The legacy backend-driven path anchors the
 * digest of the published manifest itself, which is why {@code DocumentEntity.metadataHash} can be
 * compared directly against the ATTEST's {@code d}. A wallet cannot do that: the ceremony runs before
 * the envelope is pinned and before the transaction has a slot, so the manifest's {@code ipfs_cid} and
 * {@code creation_slot} do not exist yet. It therefore attests a COMMITMENT over everything that IS
 * known — the document identity, both content hashes, the recipient set, and the SHA-256 of the exact
 * envelope bytes that will be pinned.
 *
 * <p>Two derivations sit between that commitment and what lands on chain, and both matter:
 * <ol>
 *   <li>the commitment is CBOR-serialised and Blake3-256 digested, exactly as the publisher does;</li>
 *   <li>that digest is wrapped in a self-addressing remotesign payload and it is the payload's SAID —
 *       not the digest — that the wallet seals and the publisher writes to {@code 170.d}. The wrapper
 *       is not decorative: a Veridian wallet silently drops a remotesign request that is not
 *       self-addressing.</li>
 * </ol>
 *
 * <p><b>The field set and their order are the wire format.</b> The digest is taken over serialised
 * CBOR, so adding, removing or reordering a key changes it. This must mirror the platform's
 * {@code DocumentAttestationCommitment} exactly; if that one gains a field, this one has to gain it in
 * the same position or every wallet-attested document stops correlating.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentAttestationCommitmentFactory {

    private static final String VERSION = "1.0";
    private static final String TYPE = "DOCUMENT";

    private final Cip170MetadataFactory cip170MetadataFactory;
    private final RemotesignRequestFactory remotesignRequestFactory;

    /** The label the attested value is published under; an input to the anchored SAID. */
    @Value("${reeve.metadata.label:1447}")
    private String reeveMetadataLabel;

    /**
     * @return the SAID the attesting wallet is expected to have sealed for {@code document}, or
     *         {@code null} when it cannot be derived — most commonly because the envelope has not been
     *         fetched yet, so its SHA-256 is unknown. A null is "cannot say", never "does not match":
     *         the caller must not read it as a failed attestation.
     */
    public String expectedPayloadSaid(DocumentEntity document, String walletAid) {
        if (walletAid == null || document.getEnvelopeSha256() == null) {
            return null;
        }
        MetadataMap commitment = toCommitmentMap(document);
        if (commitment == null) {
            return null;
        }
        try {
            String commitmentDigest = cip170MetadataFactory.digestOf(commitment);
            return (String) remotesignRequestFactory
                    .anchorRequestKed(walletAid, reeveMetadataLabel, commitmentDigest)
                    .get("d");
        } catch (RuntimeException e) {
            log.warn("Could not derive the expected attestation payload SAID for tx {}: {}",
                    document.getTxHash(), e.getMessage());
            return null;
        }
    }

    /**
     * Mirrors the platform's {@code DocumentAttestationCommitment.toMetadataMap}. Insertion order is
     * significant and deliberately matches it put-for-put.
     *
     * @return {@code null} when the manifest is missing a field the commitment covers — an incomplete
     *         commitment would digest to something no wallet ever signed, which is worse than
     *         admitting we cannot check.
     */
    private MetadataMap toCommitmentMap(DocumentEntity document) {
        if (document.getOrganisationId() == null || document.getDocumentId() == null
                || document.getEnvelopeVersion() == null || document.getContentHash() == null
                || document.getPlaintextHash() == null || document.getRecipientKeyHashes() == null) {
            return null;
        }
        MetadataMap map = MetadataBuilder.createMap();
        map.put("v", VERSION);
        map.put("type", TYPE);
        map.put("org_id", document.getOrganisationId());
        map.put("doc_id", document.getDocumentId());
        map.put("envelope_version", BigInteger.valueOf(document.getEnvelopeVersion()));
        map.put("content_hash", document.getContentHash());
        map.put("plaintext_hash", document.getPlaintextHash());
        map.put("envelope_sha256", document.getEnvelopeSha256());
        // slot_count is the recipient count: the attested value is the number of slots, which is the
        // length of the recipient list rather than the manifest's separately-stated count, so a
        // manifest whose count disagrees with its own list cannot be made to match.
        List<String> recipients = document.getRecipientKeyHashes();
        map.put("slot_count", BigInteger.valueOf(recipients.size()));

        // Recipient order is part of the commitment: same order as the manifest and the envelope's
        // slots, never sorted.
        MetadataList recipientKeyHashes = MetadataBuilder.createList();
        recipients.forEach(recipientKeyHashes::add);
        map.put("recipient_key_hashes", recipientKeyHashes);

        return map;
    }
}
