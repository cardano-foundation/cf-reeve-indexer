CREATE TABLE IF NOT EXISTS reeve_document
(
    tx_hash            varchar(64) PRIMARY KEY,
    document_id        varchar(255),
    organisation_id    varchar(64),
    ipfs_cid           varchar(255),
    content_hash       varchar(64),
    plaintext_hash     varchar(64),
    envelope_version   int,
    slot_count         int,
    slot               bigint,
    block_time         bigint,
    manifest_check     varchar(16) NOT NULL,
    ipfs_check         varchar(16) NOT NULL,
    content_hash_check varchar(16) NOT NULL,
    envelope_check     varchar(16) NOT NULL,
    verdict            varchar(32) NOT NULL,
    ipfs_attempts      int         NOT NULL DEFAULT 0,
    ipfs_retry_exhausted boolean   NOT NULL DEFAULT false,
    ipfs_last_attempt  timestamp,
    raw                jsonb,
    created_at         timestamp   NOT NULL DEFAULT now(),
    updated_at         timestamp   NOT NULL DEFAULT now(),
    version            bigint      NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_reeve_document_org ON reeve_document (organisation_id);
CREATE INDEX IF NOT EXISTS idx_reeve_document_verdict ON reeve_document (verdict);
-- Ordered per-document lookups (detail + envelope proxy: findTop100/findTop2 ... OrderBySlotAsc)
-- seek by document_id and read in slot order, so a same-document-id flood still returns a capped,
-- ordered page without scanning+sorting every matching row. Covers document_id-prefix queries too.
CREATE INDEX IF NOT EXISTS idx_reeve_document_document_id_slot ON reeve_document (document_id, slot);
-- Retry-sweep PARTIAL index (DocumentVerificationScheduler): only non-condemned rows are indexed
-- (WHERE ipfs_retry_exhausted = false), and within them equality on the two check columns then slot
-- for the ORDER BY slot LIMIT. So one tick seeks and stops at the batch cap, and condemned/forged
-- anchors (a flood that has aged out) are excluded from the index entirely — the sweep never even
-- walks them, bounding per-tick DB work, not just the materialised-row count.
CREATE INDEX IF NOT EXISTS idx_reeve_document_retry_sweep
    ON reeve_document (manifest_check, ipfs_check, slot)
    WHERE ipfs_retry_exhausted = false;

CREATE TABLE IF NOT EXISTS reeve_issued_card
(
    card_id           uuid PRIMARY KEY,
    subject_type      varchar(16)  NOT NULL,
    subject_id        varchar(255) NOT NULL,
    display_name      varchar(255),
    email             varchar(320),
    organisation_id   varchar(64)  NOT NULL,
    public_key        varchar(64)  NOT NULL,
    label             varchar(255),
    assurance         varchar(16)  NOT NULL,
    key_created_at    varchar(40)  NOT NULL,
    created_at        timestamp    NOT NULL DEFAULT now(),
    CONSTRAINT uq_issued_card UNIQUE (subject_id, organisation_id, public_key)
);

-- EXTERNAL holders have no stable id other than their deterministic (passkey-derived) public key, so
-- their subject_id is minted and is NOT part of the idempotency key. Enforce at-most-one EXTERNAL card
-- per (organisation_id, public_key) at the DB level so concurrent EXTERNAL issue requests are race-safe:
-- the loser hits this partial unique index and re-reads/returns the winner's card instead of inserting
-- a duplicate identity. (REEVE_ACCOUNT is already covered by uq_issued_card on the client-supplied id.)
CREATE UNIQUE INDEX IF NOT EXISTS idx_issued_card_external_key
    ON reeve_issued_card (organisation_id, public_key)
    WHERE subject_type = 'EXTERNAL';
