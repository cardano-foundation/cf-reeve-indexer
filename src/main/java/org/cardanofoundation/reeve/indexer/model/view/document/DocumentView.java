package org.cardanofoundation.reeve.indexer.model.view.document;

import java.time.LocalDateTime;
import java.util.List;

import org.cardanofoundation.reeve.indexer.model.domain.document.DocumentVerdict;
import org.cardanofoundation.reeve.indexer.model.entity.DocumentEntity;
import org.cardanofoundation.reeve.indexer.model.response.IdentityAttestationView;

/**
 * @param recipientKeyHashes sha256 of each recipient's X25519 public key, index-aligned with the IPFS
 *                           envelope's slots. Public on-chain data, exposed so the recipient filter's
 *                           behaviour is inspectable. Empty for anchors published before manifest
 *                           version 1.1, which carry no hashes and can never match a filter.
 */
public record DocumentView(String txHash, String documentId, String organisationId,
        String ipfsCid, String contentHash, String plaintextHash, Integer envelopeVersion,
        Integer slotCount, List<String> recipientKeyHashes, Long slot, Long blockTime,
        DocumentChecksView checks, DocumentVerdict verdict, LocalDateTime createdAt,
        List<IdentityAttestationView> identities) {

    /**
     * A document correlates 1:1 by its own identifier (unlike reports, which group several
     * identities under a shared metadataHash), so {@code identities} carries at most one element.
     */
    public static DocumentView from(DocumentEntity e, List<IdentityAttestationView> identities) {
        return new DocumentView(e.getTxHash(), e.getDocumentId(), e.getOrganisationId(),
                e.getIpfsCid(), e.getContentHash(), e.getPlaintextHash(),
                e.getEnvelopeVersion(), e.getSlotCount(), e.getRecipientKeyHashes(),
                e.getSlot(), e.getBlockTime(),
                new DocumentChecksView(e.getManifestCheck(),
                        e.getIpfsCheck(), e.getContentHashCheck(), e.getEnvelopeCheck()),
                e.getVerdict(), e.getCreatedAt(), identities);
    }

    public static DocumentView from(DocumentEntity e) {
        return from(e, List.of());
    }
}
