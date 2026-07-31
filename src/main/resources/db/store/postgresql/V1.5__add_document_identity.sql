-- Label-170 ATTEST verification for DOCUMENTs, mirroring reeve_reports
-- (metadata_hash/identifier/identity_verified). metadata_hash is the blake3 digest of the
-- label-1447 datum (ReeveMetadataStorage.saveAll), set on the DocumentEntity by DocumentProcessor
-- the same way ReportEntity gets its metadataHash; KeriService.verifyIdentityTx compares it
-- against an ATTEST event's dataHash to populate identifier/identity_verified.
ALTER TABLE reeve_document ADD COLUMN metadata_hash VARCHAR(255) NULL;
ALTER TABLE reeve_document ADD COLUMN identifier VARCHAR(255) NULL;
ALTER TABLE reeve_document ADD COLUMN identity_verified BOOLEAN NOT NULL DEFAULT FALSE;
