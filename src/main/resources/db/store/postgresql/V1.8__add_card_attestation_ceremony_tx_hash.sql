-- State-integrity fix (Workstream 2, Part A / A5 review): the ceremony row must durably hold the
-- on-chain ATTEST tx hash itself, not just IssuedCardEntity's copy — otherwise a crash/DB error
-- between completeStep (ATTEST_ANCHORED) and the card-row bind loses the only record of a real
-- broadcast tx. card_digest is persisted alongside kel_sequence/kel_event_said as soon as the
-- wallet's KEL anchor is verified (BEFORE tx submission is attempted), so a tx-submission failure
-- leaves the ceremony resumable — a later attest() call detects "anchor verified, tx_hash still
-- null" and resubmits the tx directly, without redoing the remotesign wallet interaction.
ALTER TABLE reeve_card_attestation_ceremony
    ADD COLUMN IF NOT EXISTS card_digest varchar(255),
    ADD COLUMN IF NOT EXISTS tx_hash     varchar(255);
