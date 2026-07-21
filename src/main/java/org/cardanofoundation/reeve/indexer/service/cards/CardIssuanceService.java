package org.cardanofoundation.reeve.indexer.service.cards;

import java.time.Clock;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Iterator;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

import lombok.Getter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import org.cardanofoundation.reeve.indexer.model.entity.IssuedCardEntity;
import org.cardanofoundation.reeve.indexer.model.repository.IssuedCardRepository;

/**
 * Assembles UNSIGNED REEVE_KEY_CARDs (§9.4). Card import is permissionless: there is no issuer
 * trust anchor and this service holds no signing key — it assembles the card's PUBLIC parts only,
 * so the emitted card carries no {@code issuer} object and no {@code signature}. Identity binding
 * is out-of-band: the importing org verifies the recipient's public key through a separate channel.
 *
 * <p>The recipient's private key is derived from a WebAuthn passkey in the holder's browser and
 * never reaches this service (I1/I5); the request schema has no private-key field and smuggled key
 * material is rejected outright (400). The card JSON is camelCase per §2.8.2, built as an ObjectNode
 * so the global SNAKE_CASE mapper cannot rename fields.
 */
@Service
public class CardIssuanceService {

    static final String CARD_TYPE = "REEVE_KEY_CARD";
    static final int CARD_VERSION = 1;

    private static final Pattern PUBLIC_KEY_SHAPE = Pattern.compile("^[0-9a-f]{64}$");
    // The request is validated against a strict ALLOWLIST of exactly these fields (see
    // rejectUnexpectedFields): a denylist is inherently incomplete (e.g. the passkey model's private
    // scalar is `seed`), so anything outside this shape — private key material or otherwise — is
    // refused up front. A raw 32-byte hex is still indistinguishable from a public key, so a value
    // pasted into `publicKey` cannot be caught (stated §5.6 limit); this guards field NAMES only.
    private static final Set<String> ALLOWED_TOP_FIELDS = Set.of("subject", "key");
    private static final Set<String> ALLOWED_SUBJECT_FIELDS =
            Set.of("subjectType", "subjectId", "displayName", "email", "organisationId");
    private static final Set<String> ALLOWED_KEY_FIELDS = Set.of("publicKey", "label", "assurance");
    // Defense-in-depth for values nested under an allowed field: any field name (at any depth) that
    // advertises private-key material is refused. Kept in sync with the private-key aliases the
    // frontend uses (`seed`/`scalar` are the X25519 private scalar; `secret`/`wrapped`/`priv*`).
    private static final Pattern FORBIDDEN_KEY_FIELD =
            Pattern.compile("private|privkey|wrapped|seed|scalar|secret");
    private static final int MAX_TEXT = 255;
    private static final int MAX_ORG = 64; // reeve_issued_card.organisation_id is varchar(64)
    private static final int MAX_EMAIL = 320;

    private final IssuedCardRepository repository;
    private final Clock clock;
    private final ObjectMapper objectMapper;
    private final boolean issuanceEnabled;

    public CardIssuanceService(IssuedCardRepository repository, Clock clock,
            ObjectMapper objectMapper,
            @Value("${indexer.issuance.enabled:true}") boolean issuanceEnabled) {
        this.repository = repository;
        this.clock = clock;
        this.objectMapper = objectMapper;
        this.issuanceEnabled = issuanceEnabled;
    }

    public boolean isEnabled() {
        return issuanceEnabled;
    }

    public JsonNode issue(JsonNode request) {
        if (!issuanceEnabled) {
            throw new CardIssuanceException(503, "CARD_ISSUANCE_UNAVAILABLE",
                    "Card issuance is disabled on this deployment");
        }
        rejectUnexpectedFields(request);
        rejectPrivateKeyMaterial(request);

        JsonNode subject = request.get("subject");
        JsonNode keyNode = request.get("key");
        if (subject == null || keyNode == null) {
            throw new CardIssuanceException(400, "INVALID_SUBJECT",
                    "Request must carry subject and key sections");
        }
        String subjectType = text(subject, "subjectType");

        String publicKey = text(keyNode, "publicKey");
        if (publicKey == null || !PUBLIC_KEY_SHAPE.matcher(publicKey).matches()) {
            throw new CardIssuanceException(400, "INVALID_PUBLIC_KEY",
                    "key.publicKey must be 64 lowercase hex characters");
        }
        // Organisation is optional: an org-less card (empty organisationId) is issuable for an
        // external/unaffiliated holder who only decrypts published documents in the Indexer. It is
        // stored as "" (never null) so the unique constraint and idempotent-reissue lookup still work.
        String organisationId = text(subject, "organisationId");
        if (organisationId == null) {
            organisationId = "";
        }
        // Bound organisationId to the DB column width (varchar(64)) so an over-long value is a clean
        // 400, not an uncaught constraint violation (500) at save time.
        if (organisationId.length() > MAX_ORG) {
            throw new CardIssuanceException(400, "INVALID_SUBJECT",
                    "organisationId must be at most " + MAX_ORG + " characters");
        }
        // assurance describes how the holder's private key is protected: PASSKEY (re-derivable from a
        // WebAuthn passkey PRF, never stored) or PORTABLE (a raw/exported key).
        String assurance = text(keyNode, "assurance");
        if (assurance == null) {
            assurance = "PORTABLE";
        } else if (!"PASSKEY".equals(assurance) && !"PORTABLE".equals(assurance)) {
            throw new CardIssuanceException(400, "INVALID_ASSURANCE",
                    "key.assurance must be PASSKEY or PORTABLE");
        }
        String displayName = bounded(subject, "displayName", MAX_TEXT, "INVALID_SUBJECT");
        String label = bounded(keyNode, "label", MAX_TEXT, "INVALID_LABEL");
        String email = boundedEmail(subject);

        // Resolve the subject id and idempotency key by subject type. A retry (double-click, timeout
        // re-POST) must return the ORIGINAL card rather than mint a duplicate identity.
        String subjectId;
        if ("REEVE_ACCOUNT".equals(subjectType)) {
            subjectId = text(subject, "subjectId");
            if (subjectId == null || subjectId.isBlank()) {
                throw new CardIssuanceException(400, "INVALID_SUBJECT",
                        "REEVE_ACCOUNT requires the holder's Keycloak sub as subjectId");
            }
            if (subjectId.length() > MAX_TEXT) {
                throw new CardIssuanceException(400, "INVALID_SUBJECT",
                        "subjectId must be at most " + MAX_TEXT + " characters");
            }
            // REEVE_ACCOUNT identity is the client-supplied Keycloak sub: idempotent on it.
            Optional<IssuedCardEntity> existing = repository
                    .findBySubjectIdAndOrganisationIdAndPublicKey(subjectId, organisationId, publicKey);
            if (existing.isPresent()) {
                return toCardJson(existing.get());
            }
        } else if ("EXTERNAL".equals(subjectType)) {
            // An EXTERNAL holder has no stable id other than their (passkey-derived, deterministic)
            // public key, so issuance is idempotent on (organisationId, publicKey): a retry with the
            // same key returns the same card instead of minting a second external identity. Mint a
            // fresh id ONLY when no such card exists yet.
            Optional<IssuedCardEntity> existing = repository
                    .findFirstBySubjectTypeAndOrganisationIdAndPublicKey("EXTERNAL", organisationId, publicKey);
            if (existing.isPresent()) {
                return toCardJson(existing.get());
            }
            subjectId = UUID.randomUUID().toString();
        } else {
            throw new CardIssuanceException(400, "INVALID_SUBJECT",
                    "subjectType must be REEVE_ACCOUNT or EXTERNAL");
        }

        String createdAt = DateTimeFormatter.ISO_INSTANT
                .format(clock.instant().truncatedTo(ChronoUnit.SECONDS));

        IssuedCardEntity entity = IssuedCardEntity.builder()
                .cardId(UUID.randomUUID())
                .subjectType(subjectType).subjectId(subjectId)
                .displayName(displayName).email(email)
                .organisationId(organisationId)
                .publicKey(publicKey).label(label)
                .assurance(assurance)
                .keyCreatedAt(createdAt)
                .build();
        try {
            repository.save(entity);
        } catch (DataIntegrityViolationException race) {
            // A concurrent request inserted the same idempotency key first (uq_issued_card for
            // REEVE_ACCOUNT, or the EXTERNAL partial unique index). Return that winner's card rather
            // than surfacing the constraint violation as a 500, so issuance stays idempotent even
            // under a race that the earlier read-then-insert check could not close.
            Optional<IssuedCardEntity> winner = "EXTERNAL".equals(subjectType)
                    ? repository.findFirstBySubjectTypeAndOrganisationIdAndPublicKey(
                            "EXTERNAL", organisationId, publicKey)
                    : repository.findBySubjectIdAndOrganisationIdAndPublicKey(
                            subjectId, organisationId, publicKey);
            if (winner.isPresent()) {
                return toCardJson(winner.get());
            }
            throw race;
        }
        return toCardJson(entity);
    }

    public Page<IssuedCardEntity> registry(String orgId, String subjectId, int page, int size) {
        PageRequest pageRequest = PageRequest.of(Math.max(0, page),
                Math.min(Math.max(1, size), 200), Sort.by(Sort.Direction.DESC, "createdAt"));
        if (orgId != null && !orgId.isBlank()) {
            return repository.findByOrganisationId(orgId, pageRequest);
        }
        if (subjectId != null && !subjectId.isBlank()) {
            return repository.findBySubjectId(subjectId, pageRequest);
        }
        return repository.findAll(pageRequest);
    }

    /** Re-assembles the §2.8.2 UNSIGNED card JSON (public parts) from a registry row. */
    public JsonNode toCardJson(IssuedCardEntity e) {
        ObjectNode card = objectMapper.createObjectNode();
        card.put("v", CARD_VERSION);
        card.put("type", CARD_TYPE);
        ObjectNode subject = card.putObject("subject");
        subject.put("subjectType", e.getSubjectType());
        subject.put("subjectId", e.getSubjectId());
        putIfPresent(subject, "displayName", e.getDisplayName());
        putIfPresent(subject, "email", e.getEmail());
        subject.put("organisationId", e.getOrganisationId());
        ObjectNode keyNode = card.putObject("key");
        keyNode.put("publicKey", e.getPublicKey());
        putIfPresent(keyNode, "label", e.getLabel());
        keyNode.put("assurance", e.getAssurance());
        keyNode.put("createdAt", e.getKeyCreatedAt());
        return card;
    }

    public Optional<JsonNode> exportCard(UUID cardId) {
        return repository.findById(cardId).map(this::toCardJson);
    }

    /**
     * Strict allowlist: the request may carry ONLY {subject, key}, subject only its known public
     * fields, and key only {publicKey, label, assurance}. Any other field — a smuggled `seed`,
     * `scalar`, `privateKey`, or just an unknown key — is refused before assembly (I5), so private
     * key material cannot cross the trust boundary even under a name the denylist has not seen.
     */
    private void rejectUnexpectedFields(JsonNode request) {
        requireOnly(request, ALLOWED_TOP_FIELDS);
        requireOnly(request.get("subject"), ALLOWED_SUBJECT_FIELDS);
        requireOnly(request.get("key"), ALLOWED_KEY_FIELDS);
    }

    private static void requireOnly(JsonNode node, Set<String> allowed) {
        if (node == null || !node.isObject()) {
            return;
        }
        for (Iterator<String> it = node.fieldNames(); it.hasNext(); ) {
            String field = it.next();
            if (!allowed.contains(field)) {
                throw new CardIssuanceException(400, "CARD_CONTAINS_PRIVATE_KEY",
                        "The issuance request may carry only the whitelisted public fields; "
                                + "unexpected field '" + field + "' is refused (I5)");
            }
        }
    }

    private void rejectPrivateKeyMaterial(JsonNode node) {
        if (node == null) {
            return;
        }
        if (node.isObject()) {
            for (Iterator<String> it = node.fieldNames(); it.hasNext(); ) {
                String field = it.next();
                if (isForbiddenKeyField(field)) {
                    throw new CardIssuanceException(400, "CARD_CONTAINS_PRIVATE_KEY",
                            "The issuance request must never carry private key material (I5)");
                }
                rejectPrivateKeyMaterial(node.get(field));
            }
        } else if (node.isArray()) {
            node.forEach(this::rejectPrivateKeyMaterial);
        }
    }

    private static boolean isForbiddenKeyField(String field) {
        // Normalise away case and word separators so private_key / private-key / privateKeyHex all
        // collapse to a form the token patterns match.
        String normalized = field.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
        return FORBIDDEN_KEY_FIELD.matcher(normalized).find();
    }

    private static String text(JsonNode node, String field) {
        JsonNode value = node.get(field);
        return value != null && value.isTextual() && !value.asText().isBlank()
                ? value.asText() : null;
    }

    private static String bounded(JsonNode node, String field, int max, String title) {
        String value = text(node, field);
        if (value != null && value.length() > max) {
            throw new CardIssuanceException(400, title,
                    field + " must be at most " + max + " characters");
        }
        return value;
    }

    private static String boundedEmail(JsonNode node) {
        String value = text(node, "email");
        if (value == null) {
            return null;
        }
        int at = value.indexOf('@');
        boolean malformed = value.length() > MAX_EMAIL || at <= 0
                || at != value.lastIndexOf('@') || at == value.length() - 1;
        if (malformed) {
            throw new CardIssuanceException(400, "INVALID_EMAIL",
                    "email must be a valid address of at most " + MAX_EMAIL + " characters");
        }
        return value;
    }

    private static void putIfPresent(ObjectNode node, String field, String value) {
        if (value != null && !value.isBlank()) {
            node.put(field, value);
        }
    }

    @Getter
    public static class CardIssuanceException extends RuntimeException {
        private final int status;
        private final String title;

        public CardIssuanceException(int status, String title, String detail) {
            super(detail);
            this.status = status;
            this.title = title;
        }
    }
}
