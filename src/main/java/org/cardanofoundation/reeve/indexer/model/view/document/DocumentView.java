package org.cardanofoundation.reeve.indexer.model.view.document;

import java.time.LocalDateTime;

import org.cardanofoundation.reeve.indexer.model.domain.document.DocumentVerdict;
import org.cardanofoundation.reeve.indexer.model.entity.DocumentEntity;

public record DocumentView(String txHash, String documentId, String organisationId,
        String ipfsCid, String contentHash, String plaintextHash, Integer envelopeVersion,
        Integer slotCount, Long slot, Long blockTime, DocumentChecksView checks,
        DocumentVerdict verdict, LocalDateTime createdAt) {

    public static DocumentView from(DocumentEntity e) {
        return new DocumentView(e.getTxHash(), e.getDocumentId(), e.getOrganisationId(),
                e.getIpfsCid(), e.getContentHash(), e.getPlaintextHash(),
                e.getEnvelopeVersion(), e.getSlotCount(), e.getSlot(), e.getBlockTime(),
                new DocumentChecksView(e.getManifestCheck(),
                        e.getIpfsCheck(), e.getContentHashCheck(), e.getEnvelopeCheck()),
                e.getVerdict(), e.getCreatedAt());
    }
}
