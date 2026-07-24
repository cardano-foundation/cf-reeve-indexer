-- Card-attestation ceremony state machine (Workstream 2, Part A / A3): the indexer's own KERI
-- agent pairing with a Veridian wallet, that wallet presenting a credential, then anchoring a
-- CIP-170 ATTEST for the card being attested. Simpler than the platform's keri_attestation module's
-- ceremony table: no per-user identity link, no binding_version/relink, no AUTH_BEGIN step — one
-- card, one ceremony, one wallet AID pairs/presents/attests it directly, so wallet_aid/
-- wallet_oobi_url live on this row itself.
CREATE TABLE IF NOT EXISTS reeve_card_attestation_ceremony
(
    id                   uuid PRIMARY KEY,
    card_id              uuid          NOT NULL REFERENCES reeve_issued_card (card_id),
    wallet_aid           varchar(255),
    wallet_oobi_url      varchar(2048),
    state                varchar(32)   NOT NULL,
    attempt_generation   int           NOT NULL DEFAULT 0,
    request_exn_said     varchar(255),
    payload_said         varchar(255),
    kel_floor_sequence   varchar(64),
    kel_sequence         varchar(64),
    kel_event_said       varchar(255),
    credential_said      varchar(255),
    schema_said          varchar(255),
    error_title          varchar(255),
    error_detail         varchar(1024),
    created_at           timestamp     NOT NULL DEFAULT now(),
    updated_at           timestamp     NOT NULL DEFAULT now(),
    expires_at           timestamp     NOT NULL
);

-- Look up a card's ceremony history/current attempt.
CREATE INDEX IF NOT EXISTS idx_card_attestation_ceremony_card_id
    ON reeve_card_attestation_ceremony (card_id);
