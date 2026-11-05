package org.cardanofoundation.reeve.indexer.model.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    /**
     * The one query behind the public listing: three independent, independently-optional filters.
     * Four nullable-parameter branches beat the 2^3 named methods the combinations would otherwise
     * need, and {@code = ANY(...)} is what the GIN index on recipient_key_hashes serves.
     *
     * <p>Native rather than JPQL because Postgres array containment has no portable JPQL spelling.
     * The {@code CAST(:param AS text)} wrappers are required, not decoration: without them Postgres
     * cannot infer a type for the bind parameter in the {@code IS NULL} branch and fails with
     * "could not determine data type of parameter".
     *
     * <p>NOTE: Spring appends {@code Pageable}'s sort to this SQL verbatim, so the ORDER BY it
     * produces must name COLUMNS, not entity properties. {@code DocumentService.SORTABLE_COLUMNS}
     * owns that mapping.
     */
    @Query(value = """
            SELECT * FROM reeve_document d
            WHERE (CAST(:orgId AS text) IS NULL OR d.organisation_id = CAST(:orgId AS text))
              AND (CAST(:verdict AS text) IS NULL OR d.verdict = CAST(:verdict AS text))
              AND (CAST(:recipientKeyHash AS text) IS NULL
                   OR CAST(:recipientKeyHash AS text) = ANY(d.recipient_key_hashes))
            """,
            countQuery = """
            SELECT count(*) FROM reeve_document d
            WHERE (CAST(:orgId AS text) IS NULL OR d.organisation_id = CAST(:orgId AS text))
              AND (CAST(:verdict AS text) IS NULL OR d.verdict = CAST(:verdict AS text))
              AND (CAST(:recipientKeyHash AS text) IS NULL
                   OR CAST(:recipientKeyHash AS text) = ANY(d.recipient_key_hashes))
            """,
            nativeQuery = true)
    Page<DocumentEntity> search(@Param("orgId") String orgId,
            @Param("verdict") String verdict,
            @Param("recipientKeyHash") String recipientKeyHash,
            Pageable pageable);

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
