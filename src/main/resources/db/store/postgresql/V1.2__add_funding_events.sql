-- FUNDING storage: one row per event (with its inline spend record), plus child tables for
-- allocations and their milestones.

-- EventEntity
CREATE SEQUENCE IF NOT EXISTS reeve_event_seq START 1 INCREMENT BY 50;
CREATE TABLE IF NOT EXISTS reeve_event (
    id BIGINT PRIMARY KEY DEFAULT nextval('reeve_event_seq'),
    tx_hash VARCHAR(255) NOT NULL,
    organisation_id VARCHAR(255) NOT NULL,
    event_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(255) NOT NULL,
    event_category VARCHAR(50) NOT NULL,
    funding_tx VARCHAR(255),
    funding_id VARCHAR(255),
    funding_entity VARCHAR(255),
    amount_rcy DECIMAL(38, 8),
    amount_fcy DECIMAL(38, 8),
    vendor VARCHAR(255),
    spending_category VARCHAR(255),
    fx_rate VARCHAR(255),
    hash VARCHAR(255),
    notes TEXT,
    currency_id VARCHAR(255),
    currency_cust_code VARCHAR(255),
    date DATE,
    version VARCHAR(50),
    creation_slot BIGINT,
    event_timestamp VARCHAR(64),
    ipfs_cid VARCHAR(255),
    metadata_hash VARCHAR(255),
    total_amount DECIMAL(38, 8),
    custom_data JSONB,
    raw JSONB,
    CONSTRAINT uq_reeve_event_tx_event UNIQUE (tx_hash, event_id)
);
ALTER SEQUENCE reeve_event_seq OWNED BY reeve_event.id;

CREATE INDEX IF NOT EXISTS idx_reeve_event_organisation_id ON reeve_event (organisation_id);
CREATE INDEX IF NOT EXISTS idx_reeve_event_tx_hash ON reeve_event (tx_hash);
CREATE INDEX IF NOT EXISTS idx_reeve_event_type ON reeve_event (event_type);
CREATE INDEX IF NOT EXISTS idx_reeve_event_date ON reeve_event (date);

-- EventAllocationEntity
CREATE SEQUENCE IF NOT EXISTS reeve_event_allocation_seq START 1 INCREMENT BY 50;
CREATE TABLE IF NOT EXISTS reeve_event_allocation (
    id BIGINT PRIMARY KEY DEFAULT nextval('reeve_event_allocation_seq'),
    event_ref_id BIGINT NOT NULL REFERENCES reeve_event (id) ON DELETE CASCADE,
    project_id VARCHAR(255),
    project_title VARCHAR(255),
    sub_project_id VARCHAR(255),
    sub_project_title VARCHAR(255)
);
ALTER SEQUENCE reeve_event_allocation_seq OWNED BY reeve_event_allocation.id;

CREATE INDEX IF NOT EXISTS idx_reeve_event_allocation_event ON reeve_event_allocation (event_ref_id);
CREATE INDEX IF NOT EXISTS idx_reeve_event_allocation_project ON reeve_event_allocation (project_id);

-- EventMilestoneEntity
CREATE SEQUENCE IF NOT EXISTS reeve_event_milestone_seq START 1 INCREMENT BY 50;
CREATE TABLE IF NOT EXISTS reeve_event_milestone (
    id BIGINT PRIMARY KEY DEFAULT nextval('reeve_event_milestone_seq'),
    allocation_id BIGINT NOT NULL REFERENCES reeve_event_allocation (id) ON DELETE CASCADE,
    milestone_id VARCHAR(255),
    milestone_title VARCHAR(255),
    allocated_amount DECIMAL(38, 8)
);
ALTER SEQUENCE reeve_event_milestone_seq OWNED BY reeve_event_milestone.id;

CREATE INDEX IF NOT EXISTS idx_reeve_event_milestone_allocation ON reeve_event_milestone (allocation_id);
