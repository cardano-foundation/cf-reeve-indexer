package org.cardanofoundation.reeve.indexer.service.document;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;
import java.util.regex.Pattern;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.stereotype.Service;

import com.bloxbean.cardano.client.util.HexUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.cardanofoundation.reeve.indexer.model.domain.document.CheckStatus;
import org.cardanofoundation.reeve.indexer.model.entity.DocumentEntity;
import org.cardanofoundation.reeve.indexer.model.repository.DocumentRepository;
import org.cardanofoundation.reeve.indexer.processor.IpfsGatewayClient;

/**
 * §9.3 checks 3-5. Check 4 (content hash) runs only when the ciphertext actually decodes —
 * an undecodable envelope is MALFORMED_ENVELOPE, never a fake CONTENT_HASH_MISMATCH.
 * IPFS failures are transient by nature: the verdict turns IPFS_UNAVAILABLE after
 * {@code failAfterAttempts}, but retries continue and a later success recovers the row.
 */
@Service
@Slf4j
public class DocumentEnvelopeVerifier {

    private static final Pattern HEX_24 = Pattern.compile("^[0-9a-f]{24}$");
    private static final Pattern HEX_64 = Pattern.compile("^[0-9a-f]{64}$");
    private static final Pattern HEX_96 = Pattern.compile("^[0-9a-f]{96}$");
    private static final String ENVELOPE_TYPE = "REEVE_ENCRYPTED_DOCUMENT";
    private static final int SUPPORTED_ENVELOPE_VERSION = 1;

    private final IpfsGatewayClient ipfsGatewayClient;
    private final DocumentRepository documentRepository;
    private final ObjectMapper objectMapper;
    private final int failAfterAttempts;
    private final int maxAttempts;

    public DocumentEnvelopeVerifier(IpfsGatewayClient ipfsGatewayClient,
            DocumentRepository documentRepository, ObjectMapper objectMapper,
            @Value("${indexer.verification.ipfs-fail-after-attempts:3}") int failAfterAttempts,
            @Value("${indexer.verification.ipfs-max-attempts:12}") int maxAttempts) {
        this.ipfsGatewayClient = ipfsGatewayClient;
        this.documentRepository = documentRepository;
        this.objectMapper = objectMapper;
        this.failAfterAttempts = failAfterAttempts;
        this.maxAttempts = maxAttempts;
    }

    public void verify(DocumentEntity entity) {
        try {
            if (entity.getManifestCheck() != CheckStatus.PASS || entity.getIpfsCid() == null) {
                return; // nothing to fetch for a malformed manifest
            }
            // Capped fetch (shared limit with the read proxy): a hostile anchor cannot make the
            // verifier buffer an unbounded IPFS response. Over-cap content reads as a failed fetch
            // and is retried/aged out like any other unresolved IPFS check, never buffered whole.
            Optional<byte[]> body =
                    ipfsGatewayClient.fetchBytes(entity.getIpfsCid(), IpfsGatewayClient.MAX_ENVELOPE_BYTES);
            entity.setIpfsLastAttempt(LocalDateTime.now());
            if (body.isEmpty()) {
                entity.setIpfsAttempts(entity.getIpfsAttempts() + 1);
                if (entity.getIpfsAttempts() >= failAfterAttempts) {
                    entity.setIpfsCheck(CheckStatus.FAIL);
                }
                if (entity.getIpfsAttempts() >= maxAttempts) {
                    // Retry budget exhausted: condemn the row so the scheduler sweep stops selecting
                    // (and stops even index-walking) it — the per-tick DB bound after publisher removal.
                    entity.setIpfsRetryExhausted(true);
                }
                entity.recomputeVerdict();
                documentRepository.save(entity);
                return;
            }
            entity.setIpfsCheck(CheckStatus.PASS);
            evaluateEnvelope(entity, new String(body.get(), StandardCharsets.UTF_8));
            entity.recomputeVerdict();
            documentRepository.save(entity);
        } catch (OptimisticLockingFailureException e) {
            // Lost the race against a concurrent writer on the same row (e.g. DocumentProcessor
            // re-indexing the same tx). Do not rethrow and do not retry inline here - the
            // scheduler will pick this row up again on its next sweep.
            log.warn("Concurrent update while verifying envelope for tx {}, will be retried by "
                    + "the scheduler/next event", entity.getTxHash());
        } catch (Exception e) {
            log.error("Envelope verification failed for tx {}: {}", entity.getTxHash(),
                    e.getMessage());
        }
    }

    private void evaluateEnvelope(DocumentEntity entity, String body) {
        JsonNode envelope;
        try {
            envelope = objectMapper.readTree(body);
        } catch (Exception e) {
            entity.setEnvelopeCheck(CheckStatus.FAIL);
            entity.setContentHashCheck(CheckStatus.PENDING);
            return;
        }
        byte[] ciphertext = decodeCiphertext(envelope);
        if (ciphertext != null && entity.getContentHash() != null) {
            String computed = sha256Hex(ciphertext);
            entity.setContentHashCheck(entity.getContentHash().equals(computed)
                    ? CheckStatus.PASS : CheckStatus.FAIL);
        } else {
            entity.setContentHashCheck(CheckStatus.PENDING);
        }
        entity.setEnvelopeCheck(isWellFormed(entity, envelope, ciphertext)
                ? CheckStatus.PASS : CheckStatus.FAIL);
    }

    private byte[] decodeCiphertext(JsonNode envelope) {
        JsonNode payload = envelope.get("payload");
        if (payload == null || payload.get("ciphertext") == null
                || !payload.get("ciphertext").isTextual()) {
            return null;
        }
        try {
            return Base64.getDecoder().decode(payload.get("ciphertext").asText());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private boolean isWellFormed(DocumentEntity entity, JsonNode envelope, byte[] ciphertext) {
        if (!envelope.isObject() || ciphertext == null) {
            return false;
        }
        JsonNode version = envelope.get("version");
        // isIntegralNumber() first: canConvertToInt()+asInt() would truncate a fractional 1.9 to 1
        // and wrongly accept it as v1 (I7 — an envelope that is not exactly version 1 must fail
        // visibly, matching the frontend's strict `version !== 1` check), so reject non-integers.
        if (version == null || !version.isIntegralNumber() || !version.canConvertToInt()
                || version.asInt() != SUPPORTED_ENVELOPE_VERSION
                || entity.getEnvelopeVersion() == null
                || version.asInt() != entity.getEnvelopeVersion()) {
            return false;
        }
        if (!ENVELOPE_TYPE.equals(text(envelope, "type"))) {
            return false;
        }
        // Self-consistency with the on-chain manifest.
        if (!equalsIgnoreNull(text(envelope, "org_id"), entity.getOrganisationId())
                || !equalsIgnoreNull(text(envelope, "content_hash"), entity.getContentHash())
                || !equalsIgnoreNull(text(envelope, "plaintext_hash"), entity.getPlaintextHash())) {
            return false;
        }
        JsonNode payload = envelope.get("payload");
        String nonce = payload != null ? text(payload, "nonce") : null;
        if (nonce == null || !HEX_24.matcher(nonce).matches()) {
            return false;
        }
        JsonNode slots = envelope.get("slots");
        if (slots == null || !slots.isArray() || entity.getSlotCount() == null
                || slots.size() != entity.getSlotCount()) {
            return false;
        }
        for (JsonNode slot : slots) {
            String ephemeralPub = text(slot, "ephemeral_pub");
            String wrappedDek = text(slot, "wrapped_dek");
            if (ephemeralPub == null || !HEX_64.matcher(ephemeralPub).matches()
                    || wrappedDek == null || !HEX_96.matcher(wrappedDek).matches()) {
                return false;
            }
        }
        return true;
    }

    private static String text(JsonNode node, String field) {
        JsonNode value = node.get(field);
        return value != null && value.isTextual() ? value.asText() : null;
    }

    private static boolean equalsIgnoreNull(String actual, String expected) {
        return expected == null || expected.equals(actual);
    }

    private static String sha256Hex(byte[] bytes) {
        try {
            return HexUtil.encodeHexString(
                    MessageDigest.getInstance("SHA-256").digest(bytes));
        } catch (Exception e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }
}
