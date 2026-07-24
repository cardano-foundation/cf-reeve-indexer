package org.cardanofoundation.reeve.indexer.processor;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.Optional;
import java.util.regex.Pattern;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;

import org.cardanofoundation.reeve.indexer.model.domain.ReeveTransactionType;
import org.cardanofoundation.reeve.indexer.model.domain.document.CheckStatus;
import org.cardanofoundation.reeve.indexer.model.domain.metadata.ReeveMetadata;
import org.cardanofoundation.reeve.indexer.model.entity.DocumentEntity;
import org.cardanofoundation.reeve.indexer.model.repository.DocumentRepository;

/**
 * Indexes {@code type: DOCUMENT} manifests (contract §9.2). One row per anchoring tx; a manifest
 * that fails validation is still indexed, as MALFORMED_MANIFEST (§9.3 check 1) — a verifier that
 * silently drops bad input hides exactly what it exists to surface. Never throws: one hostile tx
 * must not roll back the yaci block batch.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DocumentProcessor implements ReeveTypeProcessor {

    private static final Pattern HASH_64_HEX = Pattern.compile("^[0-9a-f]{64}$");
    // Also the SSRF/path-traversal guard: this string is later appended to the gateway URL.
    private static final Pattern CID_SHAPE = Pattern.compile("^[a-zA-Z0-9]{10,128}$");

    private final DocumentRepository documentRepository;

    @Override
    public ReeveTransactionType supportedType() {
        return ReeveTransactionType.DOCUMENT;
    }

    @Override
    public void process(ReeveMetadata metadata) {
        try {
            DocumentEntity fresh = toEntity(metadata);
            DocumentEntity toSave = mergeWithExisting(fresh);
            documentRepository.save(toSave);
            // Deliberately NO inline envelope/IPFS verification here. This method runs inside
            // the yaci block-ingest transaction; fetching from an attacker-chosen IPFS CID can
            // take up to the gateway timeout (15s) per attempt, and a hostile or merely slow CID
            // must never be able to stall block sync. DocumentVerificationScheduler owns all
            // gateway I/O out-of-band: it already sweeps rows with
            // ipfsCheck=PENDING/FAIL, manifestCheck=PASS on its own schedule, so every freshly
            // indexed row is picked up there instead of being fetched synchronously here.
        } catch (Exception e) {
            log.error("Failed to index DOCUMENT tx {}: {}", metadata.getTxHash(), e.getMessage());
        }
    }

    /**
     * On-chain data for a given tx hash is immutable, so a reorg replay or backfill that
     * re-parses the same tx and derives identical manifest fields carries no new information.
     * Blindly rebuilding the entity in that case would reset a completed VERIFIED row's checks
     * back to PENDING, letting a mere reprocess un-verify an audit row. When the freshly parsed
     * manifest fields match the stored row exactly, keep the existing row (and its check
     * states/verdict/ipfs bookkeeping) and only refresh the slot and updatedAt from the new
     * parse. Otherwise — genuinely new data, or no prior row — index the fresh rebuild as today.
     */
    private DocumentEntity mergeWithExisting(DocumentEntity fresh) {
        Optional<DocumentEntity> existing = documentRepository.findById(fresh.getTxHash());
        if (existing.isPresent() && manifestFieldsMatch(existing.get(), fresh)) {
            DocumentEntity preserved = existing.get();
            preserved.setSlot(fresh.getSlot());
            preserved.setUpdatedAt(LocalDateTime.now());
            return preserved;
        }
        return fresh;
    }

    private static boolean manifestFieldsMatch(DocumentEntity existing, DocumentEntity fresh) {
        return Objects.equals(existing.getDocumentId(), fresh.getDocumentId())
                && Objects.equals(existing.getOrganisationId(), fresh.getOrganisationId())
                && Objects.equals(existing.getIpfsCid(), fresh.getIpfsCid())
                && Objects.equals(existing.getContentHash(), fresh.getContentHash())
                && Objects.equals(existing.getPlaintextHash(), fresh.getPlaintextHash())
                && Objects.equals(existing.getEnvelopeVersion(), fresh.getEnvelopeVersion())
                && Objects.equals(existing.getSlotCount(), fresh.getSlotCount())
                && existing.getManifestCheck() == fresh.getManifestCheck();
    }

    private DocumentEntity toEntity(ReeveMetadata metadata) {
        String organisationId =
                metadata.getOrg() != null ? metadata.getOrg().getId() : null;
        JsonNode data = metadata.getData() instanceof JsonNode node ? node : null;

        DocumentEntity.DocumentEntityBuilder builder = DocumentEntity.builder()
                .txHash(metadata.getTxHash())
                .organisationId(organisationId)
                .slot(metadata.getSlot())
                .raw(data != null ? data.toString() : null)
                // Same blake3 digest of the label-1447 datum that ReportEntity stores, computed
                // once in ReeveMetadataStorage.saveAll before dispatch to this processor — used by
                // KeriService.verifyIdentityTx to correlate a later label-170 ATTEST event.
                .metadataHash(metadata.getMetadataHash())
                .ipfsCheck(CheckStatus.PENDING)
                .contentHashCheck(CheckStatus.PENDING)
                .envelopeCheck(CheckStatus.PENDING);

        boolean valid = organisationId != null && data != null && data.isObject()
                && isNonBlankText(data.get("id"))
                && isText(data.get("ipfs_cid"), CID_SHAPE)
                && isText(data.get("content_hash"), HASH_64_HEX)
                && isText(data.get("plaintext_hash"), HASH_64_HEX)
                && isPositiveInt(data.get("envelope_version"))
                && isPositiveInt(data.get("slot_count"));

        if (data != null && data.isObject()) {
            builder.documentId(textOrNull(data.get("id")))
                    .ipfsCid(matchesOrNull(data.get("ipfs_cid"), CID_SHAPE))
                    .contentHash(matchesOrNull(data.get("content_hash"), HASH_64_HEX))
                    .plaintextHash(matchesOrNull(data.get("plaintext_hash"), HASH_64_HEX))
                    .envelopeVersion(intOrNull(data.get("envelope_version")))
                    .slotCount(intOrNull(data.get("slot_count")));
        }
        builder.manifestCheck(valid ? CheckStatus.PASS : CheckStatus.FAIL);

        DocumentEntity entity = builder.build();
        entity.recomputeVerdict();
        return entity;
    }

    private static boolean isNonBlankText(JsonNode node) {
        return node != null && node.isTextual() && !node.asText().isBlank();
    }

    private static boolean isText(JsonNode node, Pattern pattern) {
        return node != null && node.isTextual() && pattern.matcher(node.asText()).matches();
    }

    private static boolean isPositiveInt(JsonNode node) {
        // isIntegralNumber() rejects fractional JSON numbers (e.g. 1.9); canConvertToInt()
        // alone would silently truncate them to a passing int.
        return node != null && node.isIntegralNumber() && node.canConvertToInt()
                && node.asInt() >= 1;
    }

    private static String textOrNull(JsonNode node) {
        return node != null && node.isTextual() ? node.asText() : null;
    }

    private static String matchesOrNull(JsonNode node, Pattern pattern) {
        String text = textOrNull(node);
        return text != null && pattern.matcher(text).matches() ? text : null;
    }

    private static Integer intOrNull(JsonNode node) {
        return node != null && node.isIntegralNumber() && node.canConvertToInt()
                ? node.asInt() : null;
    }
}
