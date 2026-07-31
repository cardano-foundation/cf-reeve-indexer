-- Veridian card attestation, credential chain (Workstream 2, Part A / A5 follow-up). Carry the full
-- CESR chain of the presented credential on the issued card, captured at attestation time, so the
-- exported REEVE_KEY_CARD can hand it to the platform's B2 import verification -- which can resolve
-- the attesting AID's OOBI but cannot fetch this credential itself. TEXT (a chain can be large),
-- nullable like the other attestation_* columns: unattested cards leave it NULL and omit it from the
-- wire format.
ALTER TABLE reeve_issued_card ADD COLUMN attestation_credential_cesr TEXT NULL;
