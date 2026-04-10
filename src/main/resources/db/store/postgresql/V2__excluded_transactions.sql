CREATE TABLE IF NOT EXISTS reeve_excluded_tx (
    transaction_id VARCHAR(255) PRIMARY KEY,
    reason         TEXT,
    excluded_at    TIMESTAMP NOT NULL DEFAULT now()
);
