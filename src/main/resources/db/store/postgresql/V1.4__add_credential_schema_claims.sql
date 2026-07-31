-- Generalize identity_credential from LEI-hardcoding to a generic schema + claims model.
-- schema_said: leaf credential's schema SAID (label-170 AUTH_BEGIN `s`).
-- claims: JSON text of the credential's generic claim map (`m` minus the `l` labels key).
-- lei is kept (nullable) for backward compat, now derived from claims["LEI"] when present.
ALTER TABLE identity_credential ADD COLUMN schema_said VARCHAR(255) NULL;
ALTER TABLE identity_credential ADD COLUMN claims TEXT NULL;
