-- Veridian card attestation, KEL anchor on the card (Workstream 2, Part A / A5 follow-up).
--
-- The wallet already anchors the card's attestation digest in its OWN KEL (remotesign ixn event) and
-- the ceremony row already records where: kel_sequence / kel_event_said / card_digest / payload_said.
-- None of that ever reached the exported REEVE_KEY_CARD, so an importer holding only the card file
-- could not verify the anchor -- it could resolve the attesting AID's OOBI and fetch its KEL, but had
-- no way to know WHICH event to look at, nor what payload SAID that event's seal should carry.
--
-- These columns close that gap, making the KEL anchor a self-contained, independently verifiable
-- proof that does not depend on the on-chain ATTEST tx (which is now optional -- attestation_tx_hash
-- stays NULL on deployments with no funded organiser wallet configured).
--
-- Verification an importer can now perform from the card file alone:
--   1. recompute cardDigest  = Blake3-256(canonical CBOR(card JSON MINUS the attestation block))
--   2. recompute payloadSaid = saidify({i: aid, d: "", metadataLabel, metadataDigest: cardDigest}).d
--   3. resolve `oobi` -> fetch the KEL for `aid`
--   4. find the ixn event at kel_sequence, confirm its own SAID equals kel_event_said
--   5. assert that event's seal anchors the recomputed payloadSaid
--
-- metadata_label is stored as text, not a number, because it is fed to the payload SAID as a STRING
-- (RemotesignRequestFactory receives String.valueOf(label)); persisting the exact string the SAID was
-- computed over removes any numeric-formatting ambiguity when the importer rebuilds that payload.
--
-- card_digest and payload_said are INFORMATIONAL ONLY: they are what this indexer computed, carried
-- so a verifier can report a precise mismatch. A verifier MUST recompute both from the card body
-- (steps 1-2) and compare -- trusting these values as given would make step 5 verify nothing, since
-- the same party supplied both the claim and the value it is checked against.
--
-- All nullable, like every other attestation_* column: an unattested card leaves them NULL and omits
-- them from the wire format, keeping its JSON byte-identical to an unattested card's today.
ALTER TABLE reeve_issued_card ADD COLUMN attestation_kel_sequence VARCHAR(32) NULL;
ALTER TABLE reeve_issued_card ADD COLUMN attestation_kel_event_said VARCHAR(128) NULL;
ALTER TABLE reeve_issued_card ADD COLUMN attestation_metadata_label VARCHAR(32) NULL;
ALTER TABLE reeve_issued_card ADD COLUMN attestation_card_digest VARCHAR(128) NULL;
ALTER TABLE reeve_issued_card ADD COLUMN attestation_payload_said VARCHAR(128) NULL;
