package org.cardanofoundation.reeve.indexer.model.view.document;

import java.time.LocalDateTime;
import java.util.List;

import org.cardanofoundation.reeve.indexer.model.domain.document.DocumentVerdict;
import org.cardanofoundation.reeve.indexer.model.entity.DocumentEntity;
import org.cardanofoundation.reeve.indexer.model.response.IdentityAttestationView;

public record DocumentView(String txHash, String documentId, String organisationId,
        String ipfsCid, String contentHash, String plaintextHash, Integer envelopeVersion,
        Integer slotCount, Long slot, Long blockTime, DocumentChecksView checks,
        DocumentVerdict verdict, LocalDateTime createdAt,
        List<IdentityAttestationView> identities) {

    /**
     * A document correlates 1:1 by its own identifier (unlike reports, which group several
     * identities under a shared metadataHash), so {@code identities} carries at most one element.
     */
    public static DocumentView from(DocumentEntity e, List<IdentityAttestationView> identities) {
        return new DocumentView(e.getTxHash(), e.getDocumentId(), e.getOrganisationId(),
                e.getIpfsCid(), e.getContentHash(), e.getPlaintextHash(),
                e.getEnvelopeVersion(), e.getSlotCount(), e.getSlot(), e.getBlockTime(),
                new DocumentChecksView(e.getManifestCheck(),
                        e.getIpfsCheck(), e.getContentHashCheck(), e.getEnvelopeCheck()),
                e.getVerdict(), e.getCreatedAt(), identities);
    }

    public static DocumentView from(DocumentEntity e) {
        return from(e, List.of());
    }
}
