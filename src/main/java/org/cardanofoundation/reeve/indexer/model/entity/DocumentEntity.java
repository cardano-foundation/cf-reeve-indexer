package org.cardanofoundation.reeve.indexer.model.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import lombok.*;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import org.cardanofoundation.reeve.indexer.model.domain.document.CheckStatus;
import org.cardanofoundation.reeve.indexer.model.domain.document.DocumentVerdict;

@Entity
@Table(name = "reeve_document")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentEntity {

    @Id
    @Column(name = "tx_hash")
    private String txHash;

    @Column(name = "document_id")
    private String documentId;
    @Column(name = "organisation_id")
    private String organisationId;
    @Column(name = "ipfs_cid")
    private String ipfsCid;
    @Column(name = "content_hash")
    private String contentHash;
    @Column(name = "plaintext_hash")
    private String plaintextHash;
    @Column(name = "envelope_version")
    private Integer envelopeVersion;
    @Column(name = "slot_count")
    private Integer slotCount;
    @Column(name = "slot")
    private Long slot;
    @Column(name = "block_time")
    private Long blockTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "manifest_check", nullable = false)
    private CheckStatus manifestCheck;
    @Enumerated(EnumType.STRING)
    @Column(name = "ipfs_check", nullable = false)
    private CheckStatus ipfsCheck;
    @Enumerated(EnumType.STRING)
    @Column(name = "content_hash_check", nullable = false)
    private CheckStatus contentHashCheck;
    @Enumerated(EnumType.STRING)
    @Column(name = "envelope_check", nullable = false)
    private CheckStatus envelopeCheck;
    @Enumerated(EnumType.STRING)
    @Column(name = "verdict", nullable = false)
    private DocumentVerdict verdict;

    @Builder.Default
    @Column(name = "ipfs_attempts", nullable = false)
    private int ipfsAttempts = 0;
    @Column(name = "ipfs_last_attempt")
    private LocalDateTime ipfsLastAttempt;

    // Terminal flag: set once a row has exhausted its IPFS retry budget (ipfsAttempts >= maxAttempts).
    // The scheduler sweep queries only rows with this false, so condemned/forged anchors leave the
    // swept set entirely (via a partial index) instead of being residual-filtered on every tick.
    @Builder.Default
    @Column(name = "ipfs_retry_exhausted", nullable = false)
    private boolean ipfsRetryExhausted = false;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "raw")
    private String raw;

    @Builder.Default
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    @Builder.Default
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Envelope verification (DocumentVerificationScheduler/DocumentEnvelopeVerifier) does an
    // unsynchronized findById -> mutate -> save on this row, and a reprocess of the same tx can
    // race it; @Version turns a concurrent lost-update into an OptimisticLockingFailureException
    // that the writer catches and logs, trusting the next scheduler tick/event to retry rather
    // than silently clobbering a concurrent change.
    @Version
    @Column(name = "version", nullable = false)
    private long version;

    /** Recomputes the overall verdict from the four per-check statuses. */
    public void recomputeVerdict() {
        this.verdict = DocumentVerdict.compute(manifestCheck, ipfsCheck,
                contentHashCheck, envelopeCheck);
        this.updatedAt = LocalDateTime.now();
    }
}
