-- Recipient key hashes from the 1447 DOCUMENT manifest (metadata version 1.1+): sha256 of each
-- recipient's X25519 public key, lowercase hex, index-aligned with the IPFS envelope's slots.
--
-- A Postgres array rather than a child table: the list is short, bounded by slot_count, never queried
-- independently of its document and never mutated after ingest, so a join would cost more than it buys.
--
-- DEFAULT '{}' is what lets pre-1.1 anchors coexist. They carry no hashes and can never match a
-- recipient filter, which is correct - the chain is immutable and they cannot be backfilled.
ALTER TABLE reeve_document
    ADD COLUMN recipient_key_hashes text[] NOT NULL DEFAULT '{}';

-- GIN serves the `:hash = ANY(recipient_key_hashes)` containment lookup the recipient filter issues.
CREATE INDEX IF NOT EXISTS idx_reeve_document_recipient_key_hashes
    ON reeve_document USING GIN (recipient_key_hashes);
