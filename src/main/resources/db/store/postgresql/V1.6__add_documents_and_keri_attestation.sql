-- Documents, KERI identity claims and card attestation: the end state of the feat/document-module
-- migrations (formerly V1.3_documents .. V2.2), collapsed into one script. Columns that were added and
-- later dropped (reeve_document.envelope_sha256, reeve_issued_card.attestation_tx_hash,
-- reeve_card_attestation_ceremony.tx_hash) are omitted; renamed columns use their final names.

-- ---------------------------------------------------------------------------------------------------
-- identity_credential: generic schema + claims model (label-170 AUTH_BEGIN).
-- schema_said: the leaf credential's schema SAID (AUTH_BEGIN `s`).
-- claims: JSON text of the credential's generic claim map (`m` minus the `l` labels key).
-- lei stays (nullable) for backward compatibility, derived from claims["LEI"] when present.
-- ---------------------------------------------------------------------------------------------------
ALTER TABLE identity_credential ADD COLUMN schema_said VARCHAR(255) NULL;
ALTER TABLE identity_credential ADD COLUMN claims TEXT NULL;

-- ---------------------------------------------------------------------------------------------------
-- reeve_document: label-1447 DOCUMENT anchors and their verification state.
--
-- recipient_count is the manifest's `slot_count` (how many recipients the envelope wraps the key for);
-- renamed here because `slot` is the Cardano slot. The wire names stay `slot_count` / `slots`.
-- metadata_hash / identifier / identity_verified: label-170 ATTEST verification, mirroring
-- reeve_reports (metadata_hash is the blake3 digest of the label-1447 datum).
-- recipient_key_hashes: sha256 of each recipient's X25519 key (manifest 1.1+), index-aligned with the
-- envelope slots. An array, not a child table: short, bounded, never mutated. DEFAULT '{}' lets pre-1.1
-- anchors coexist; they can never match a recipient filter.
-- ---------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reeve_document
(
    tx_hash              varchar(64) PRIMARY KEY,
    document_id          varchar(255),
    organisation_id      varchar(64),
    ipfs_cid             varchar(255),
    content_hash         varchar(64),
    plaintext_hash       varchar(64),
    envelope_version     int,
    recipient_count      int,
    slot                 bigint,
    block_time           bigint,
    manifest_check       varchar(16) NOT NULL,
    ipfs_check           varchar(16) NOT NULL,
    content_hash_check   varchar(16) NOT NULL,
    envelope_check       varchar(16) NOT NULL,
    verdict              varchar(32) NOT NULL,
    ipfs_attempts        int         NOT NULL DEFAULT 0,
    ipfs_retry_exhausted boolean     NOT NULL DEFAULT false,
    ipfs_last_attempt    timestamp,
    raw                  jsonb,
    created_at           timestamp   NOT NULL DEFAULT now(),
    updated_at           timestamp   NOT NULL DEFAULT now(),
    version              bigint      NOT NULL DEFAULT 0,
    metadata_hash        varchar(255),
    identifier           varchar(255),
    identity_verified    boolean     NOT NULL DEFAULT false,
    recipient_key_hashes text[]      NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_reeve_document_org ON reeve_document (organisation_id);
CREATE INDEX IF NOT EXISTS idx_reeve_document_verdict ON reeve_document (verdict);
-- Ordered per-document lookups (detail + envelope proxy: findTop100/findTop2 ... OrderBySlotAsc) seek by
-- document_id and read in slot order, so a same-document-id flood still returns a capped, ordered page.
CREATE INDEX IF NOT EXISTS idx_reeve_document_document_id_slot ON reeve_document (document_id, slot);
-- Retry-sweep PARTIAL index (DocumentVerificationScheduler): only non-condemned rows are indexed, then
-- equality on the two check columns and slot for ORDER BY slot LIMIT, so one tick seeks and stops at the
-- batch cap and condemned/forged anchors are never walked.
CREATE INDEX IF NOT EXISTS idx_reeve_document_retry_sweep
    ON reeve_document (manifest_check, ipfs_check, slot)
    WHERE ipfs_retry_exhausted = false;
-- GIN serves the `:hash = ANY(recipient_key_hashes)` lookup of the recipient filter.
CREATE INDEX IF NOT EXISTS idx_reeve_document_recipient_key_hashes
    ON reeve_document USING GIN (recipient_key_hashes);

-- ---------------------------------------------------------------------------------------------------
-- reeve_issued_card: REEVE_KEY_CARDs and their (optional) Veridian attestation.
--
-- A card is issued first and attested later, so every attestation_* column is nullable; an unattested
-- card omits the "attestation" block from its wire format. The attestation is the wallet's own KEL
-- anchor (no on-chain tx). An importer verifies it from the card file alone:
--   1. cardDigest  = Blake3-256(canonical CBOR(card JSON minus the attestation block))
--   2. payloadSaid = saidify({i: aid, d: "", metadataLabel, metadataDigest: cardDigest}).d
--   3. resolve attestation_oobi, fetch the KEL of attestation_aid
--   4. the ixn event at attestation_kel_sequence has SAID attestation_kel_event_said
--   5. its seal anchors the recomputed payloadSaid
-- attestation_metadata_label is text because the payload SAID is computed over the label as a STRING.
-- attestation_card_digest / attestation_payload_said are INFORMATIONAL: a verifier MUST recompute them.
-- attestation_credential_cesr carries the presented credential's full CESR chain for import verification.
-- ---------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reeve_issued_card
(
    card_id                     uuid PRIMARY KEY,
    subject_type                varchar(16)  NOT NULL,
    subject_id                  varchar(255) NOT NULL,
    display_name                varchar(255),
    email                       varchar(320),
    organisation_id             varchar(64)  NOT NULL,
    public_key                  varchar(64)  NOT NULL,
    label                       varchar(255),
    assurance                   varchar(16)  NOT NULL,
    key_created_at              varchar(40)  NOT NULL,
    created_at                  timestamp    NOT NULL DEFAULT now(),
    attestation_oobi            varchar(255),
    attestation_aid             varchar(255),
    attestation_credential_said varchar(255),
    attestation_schema_said     varchar(255),
    attestation_credential_cesr text,
    attestation_kel_sequence    varchar(32),
    attestation_kel_event_said  varchar(128),
    attestation_metadata_label  varchar(32),
    attestation_card_digest     varchar(128),
    attestation_payload_said    varchar(128),
    CONSTRAINT uq_issued_card UNIQUE (subject_id, organisation_id, public_key)
);

-- EXTERNAL holders have no stable id other than their deterministic (passkey-derived) public key, so
-- enforce at most one EXTERNAL card per (organisation_id, public_key): concurrent issue requests stay
-- race-safe (the loser re-reads the winner's card). REEVE_ACCOUNT is covered by uq_issued_card.
CREATE UNIQUE INDEX IF NOT EXISTS idx_issued_card_external_key
    ON reeve_issued_card (organisation_id, public_key)
    WHERE subject_type = 'EXTERNAL';

-- ---------------------------------------------------------------------------------------------------
-- reeve_card_attestation_ceremony: the indexer's own KERI agent pairs with a Veridian wallet, the wallet
-- presents a credential, then anchors the card digest in its KEL. One card, one ceremony, one wallet AID
-- (no identity link, no AUTH_BEGIN). kel_floor_sequence rejects stale anchors; card_digest is stored with
-- kel_sequence / kel_event_said when the anchor is verified.
-- credential_issuer_aid / credential_claims are DISPLAY-ONLY claims about what the wallet presented (the
-- indexer does not verify presentations; the importer does). credential_claims is the attribute block
-- 'a' minus 'd', 'i', 'u', re-serialised, so not usable for anything byte-exact.
-- ---------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reeve_card_attestation_ceremony
(
    id                    uuid PRIMARY KEY,
    card_id               uuid          NOT NULL REFERENCES reeve_issued_card (card_id),
    wallet_aid            varchar(255),
    wallet_oobi_url       varchar(2048),
    state                 varchar(32)   NOT NULL,
    attempt_generation    int           NOT NULL DEFAULT 0,
    request_exn_said      varchar(255),
    payload_said          varchar(255),
    kel_floor_sequence    varchar(64),
    kel_sequence          varchar(64),
    kel_event_said        varchar(255),
    credential_said       varchar(255),
    schema_said           varchar(255),
    error_title           varchar(255),
    error_detail          varchar(1024),
    created_at            timestamp     NOT NULL DEFAULT now(),
    updated_at            timestamp     NOT NULL DEFAULT now(),
    expires_at            timestamp     NOT NULL,
    card_digest           varchar(255),
    credential_issuer_aid varchar(255),
    credential_claims     text
);

-- Look up a card's ceremony history / current attempt.
CREATE INDEX IF NOT EXISTS idx_card_attestation_ceremony_card_id
    ON reeve_card_attestation_ceremony (card_id);
