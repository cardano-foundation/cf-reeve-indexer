-- Permanent, human-readable project/sub-project/milestone identifier (pro_id) published in FUNDING
-- metadata. Rows indexed before the field was published stay NULL: the value was never on-chain for
-- those transactions, so there is nothing to backfill.
ALTER TABLE reeve_event_allocation ADD COLUMN pro_id VARCHAR(255);
ALTER TABLE reeve_event_allocation ADD COLUMN sub_project_pro_id VARCHAR(255);
ALTER TABLE reeve_event_milestone ADD COLUMN pro_id VARCHAR(255);
