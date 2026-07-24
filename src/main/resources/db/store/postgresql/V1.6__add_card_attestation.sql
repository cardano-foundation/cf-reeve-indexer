-- Veridian card attestation fields (Workstream 2, Part A). A card is issued first and attested
-- later via the ceremony (A2-A5), so all columns are nullable: an issued-but-unattested card has
-- them all NULL, and its REEVE_KEY_CARD wire format omits the "attestation" block entirely.
-- attestation_oobi/aid: how to resolve and who the attesting wallet AID is.
-- attestation_credential_said/schema_said: the presented credential and its schema.
-- attestation_tx_hash: the Cardano tx hash of the CIP-170 ATTEST anchoring this card's digest.
ALTER TABLE reeve_issued_card ADD COLUMN attestation_oobi VARCHAR(255) NULL;
ALTER TABLE reeve_issued_card ADD COLUMN attestation_aid VARCHAR(255) NULL;
ALTER TABLE reeve_issued_card ADD COLUMN attestation_credential_said VARCHAR(255) NULL;
ALTER TABLE reeve_issued_card ADD COLUMN attestation_schema_said VARCHAR(255) NULL;
ALTER TABLE reeve_issued_card ADD COLUMN attestation_tx_hash VARCHAR(255) NULL;
