package org.cardanofoundation.reeve.indexer.model.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;

import lombok.*;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.Type;
import org.hibernate.type.SqlTypes;

import io.hypersistence.utils.hibernate.type.array.ListArrayType;

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
    /**
     * How many recipients the IPFS envelope wraps the document key for — one entry per recipient.
     * Distinct from {@link #slot}, which is the Cardano slot this anchor landed in.
     */
    @Column(name = "recipient_count")
    private Integer recipientCount;

    /**
     * Recipient key hashes from the manifest, index-aligned with the envelope's recipient entries.
     * Empty for pre-1.1 anchors, which carry no hashes and so never match a recipient filter.
     *
     * <p>{@code @Builder.Default} is load-bearing: this class is {@code @Builder}, and without it
     * Lombok drops the initialiser and the field arrives null on every built instance.
     */
    @Type(ListArrayType.class)
    @Column(name = "recipient_key_hashes", columnDefinition = "text[]")
    @Builder.Default
    private List<String> recipientKeyHashes = new ArrayList<>();

    /** Cardano slot of the block this anchor was published in. */
    @Column(name = "slot")
    private Long slot;
    /** POSIX seconds of that block. Chain-derived, unlike anything in the manifest payload. */
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

    // Label-170 ATTEST verification (KeriService.verifyIdentityTx), mirroring ReportEntity:
    // metadataHash is the blake3 digest of this tx's label-1447 datum (ReeveMetadataStorage.saveAll),
    // set by DocumentProcessor at index time; identifier/identityVerified are populated once an
    // ATTEST event's dataHash matches and the KEL+credential gate passes.
    @Column(name = "metadata_hash")
    private String metadataHash;
    @Column(name = "identifier")
    private String identifier;
    @Builder.Default
    @Column(name = "identity_verified", nullable = false)
    private boolean identityVerified = false;

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
