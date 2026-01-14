-- OrganisationEntity
CREATE TABLE IF NOT EXISTS reeve_organisation (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    currency_id VARCHAR(255),
    country_code VARCHAR(255),
    tax_id_number VARCHAR(255),
    tx_hash VARCHAR(255),
    assets TEXT[]
);

-- CurrencyEntity (composite key)
CREATE TABLE IF NOT EXISTS reeve_currency (
    organisation_id VARCHAR(255) NOT NULL,
    currency_id VARCHAR(255) NOT NULL,
    cust_code VARCHAR(255),
    PRIMARY KEY (organisation_id, currency_id)
);

-- TransactionEntity
CREATE TABLE IF NOT EXISTS reeve_transactions (
    id VARCHAR(255) PRIMARY KEY,
    tx_hash VARCHAR(255) NOT NULL,
    internal_number VARCHAR(255) NOT NULL,
    accounting_period VARCHAR(255) NOT NULL,
    batch_id VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    organisation_id VARCHAR(255) NOT NULL
);

-- TransactionItemEntity
CREATE TABLE IF NOT EXISTS reeve_transaction_item (
    id VARCHAR(255) PRIMARY KEY,
    transaction_id VARCHAR(255) NOT NULL,
    amount_lcy DECIMAL(19, 4),
    amount_fcy DECIMAL(19, 4) NOT NULL,
    fx_rate VARCHAR(255) NOT NULL,
    document_number VARCHAR(255),
    currency VARCHAR(255),
    costcenter_name VARCHAR(255),
    costcenter_cust_code VARCHAR(255),
    vat_rate VARCHAR(50),
    vat_cust_code VARCHAR(255),
    event_code VARCHAR(255),
    event_name VARCHAR(255),
    project_cust_code VARCHAR(255),
    project_name VARCHAR(255),
    counterparty_type VARCHAR(255),
    counterparty_cust_code VARCHAR(255)
);

-- ReportEntity
CREATE SEQUENCE IF NOT EXISTS reeve_reports_seq START 1 INCREMENT BY 50;
CREATE TABLE IF NOT EXISTS reeve_reports (
    id BIGINT PRIMARY KEY DEFAULT nextval('reeve_reports_seq'),
    tx_hash VARCHAR(255),
    type VARCHAR(50),
    interval VARCHAR(50),
    year INTEGER,
    period INTEGER,
    sub_type VARCHAR(100),
    ver BIGINT,
    fields JSONB,
    organisation_id VARCHAR(255) NOT NULL,
    identity_verified BOOLEAN DEFAULT FALSE,
    identifier VARCHAR(255),
    metadata_hash VARCHAR(255)
);
ALTER SEQUENCE reeve_reports_seq OWNED BY reeve_reports.id;

-- CredentialEntity
CREATE TABLE IF NOT EXISTS identity_credential (
    prefix_id VARCHAR(255) PRIMARY KEY,
    tx_hash VARCHAR(255),
    credential_chain TEXT,
    metadata_labels JSONB,
    lei VARCHAR(255),
    valid BOOLEAN
);

-- IdentityEventEntity
CREATE TABLE IF NOT EXISTS reeve_identity_event (
    tx_hash VARCHAR(255) PRIMARY KEY,
    sequence_number VARCHAR(50),
    data_hash VARCHAR(255),
    event_hash VARCHAR(255),
    identifier VARCHAR(255),
    type VARCHAR(100)
);
