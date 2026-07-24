package org.cardanofoundation.reeve.indexer.model.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import org.cardanofoundation.reeve.indexer.model.domain.document.CheckStatus;
import org.cardanofoundation.reeve.indexer.model.domain.document.DocumentVerdict;
import org.cardanofoundation.reeve.indexer.model.entity.DocumentEntity;

public interface DocumentRepository extends JpaRepository<DocumentEntity, String> {

    // txHash is also the @Id, but a named method mirrors ReportRepository.findByTxHash so
    // KeriService.verifyIdentityTx can correlate an ATTEST event across both entity types uniformly.
    Optional<DocumentEntity> findByTxHash(String txHash);

    Page<DocumentEntity> findByOrganisationId(String organisationId, Pageable pageable);

    Page<DocumentEntity> findByVerdict(DocumentVerdict verdict, Pageable pageable);

    Page<DocumentEntity> findByOrganisationIdAndVerdict(String organisationId,
            DocumentVerdict verdict, Pageable pageable);

    // Detail loads at most the first 100 anchors: now that anyone may anchor a document id (no
    // publisher gate), a hostile flood of same-id anchors must not materialise unbounded rows into
    // one public response. The capped list's size (>= 2) is itself the duplicate signal — no COUNT.
    List<DocumentEntity> findTop100ByDocumentIdOrderBySlotAsc(String documentId);

    // The envelope proxy needs only enough rows to tell "single anchor" from "ambiguous" (>1).
    List<DocumentEntity> findTop2ByDocumentIdOrderBySlotAsc(String documentId);

    // Direct lookup for the txHash-disambiguated envelope path — never loads the full anchor set.
    List<DocumentEntity> findByDocumentIdAndTxHash(String documentId, String txHash);

    // Retry sweep: only rows that have NOT exhausted their retry budget (ipfsRetryExhausted = false)
    // are selected, so a condemned/forged anchor leaves the swept set entirely — a partial index on
    // (manifest_check, ipfs_check, slot) WHERE ipfs_retry_exhausted = false means the sweep never
    // even index-walks condemned rows. The Pageable bounds how many eligible rows one tick loads.
    List<DocumentEntity> findByManifestCheckAndIpfsCheckAndIpfsRetryExhaustedFalse(
            CheckStatus manifestCheck, CheckStatus ipfsCheck, Pageable pageable);
}
