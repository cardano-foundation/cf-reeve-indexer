# Indexer: Veridian card attestation ceremony + platform import verification — Design

**Date:** 2026-07-24
**Status:** Approved — implementing
**Repos:** `reeve-indexing-example` (ceremony + card fields + its frontend) AND `cf-reeve-platform` (`document_vault` card import verification)
**Workstream:** 2 of 2. WS1 (multi-schema verification + document checkmark + badge) is complete.

## Goal

Let a user **attest a card they issued in the indexer** using their **Veridian wallet**, via the **full ceremony** — OOBI exchange → credential presentation → attestation. The attested card carries the info needed to verify it later (the **OOBI**, the presenting **AID**, the presented **credential SAID/schema**, and the on-chain **attestation tx**). When the **platform** (`cf-reeve-platform`) imports such a card, it **verifies the credential and the attestation**.

**Key architectural constraint (user-confirmed):** the indexer is a **standalone single-service app** with its own KERIA + yaci-store. It is **NOT** connected to the platform's Kafka and must **not** communicate with the platform. The ceremony runs **synchronously in the indexer's request thread** (like `keri_attestation` does), which is fine here — no multi-pod/event decoupling is required in the indexer. The platform's refactor is a separate, platform-only concern.

## Reference implementation

The platform's `keri_attestation` module (in `cf-reeve-platform`) is the proven, working implementation of this exact ceremony (built this session). Port its patterns, adapting the **target from DOCUMENT to CARD**:
- OOBI exchange / agent bootstrap: `keri_attestation/.../config/SignifyClientConfig.java` (witnessed agent AID, **stable bran** — do NOT use a random passcode fallback, it rotates identity on restart), `KeriOobiService`.
- Credential presentation (IPEX apply→offer/grant→admit, dual-path spontaneous grant): `KeriCredentialService`.
- Attestation (remotesign → CIP-170 ATTEST, KEL floor + ixn seal verification, **re-resolve the wallet OOBI before reading the KEL**): `KeriAttestService`.
- Ceremony state machine + notification correlator: `CeremonyService`, `KeriNotificationCorrelator` (snapshot-exclude pre-existing refs; non-fatal retry pre-check).
- CIP-170 metadata: `Cip170MetadataFactory` (label-170 ATTEST/AUTH_BEGIN; `s`=schema SAID for AUTH_BEGIN, `s`=kel seq for ATTEST; Blake3-256 Diger digest).

The indexer already has a verify-only `SignifyClient` (`KeriConfig`/`KeriService`) and the signify lib supports the full IPEX + remotesign API — so this extends existing infra rather than adding a new dependency.

## The card-format contract (shared, define first)

The attested `REEVE_KEY_CARD` gains an optional `attestation` block. Absent = an unattested card (today's behavior, still valid). Present = a Veridian-attested card:

```json
{
  "v": 1, "type": "REEVE_KEY_CARD",
  "subject": { ... }, "key": { ... },
  "attestation": {
    "oobi": "https://.../oobi/<walletAid>/agent/<agentEid>",   // wallet OOBI (how to resolve the AID)
    "aid": "<wallet AID that attested>",
    "credentialSaid": "<presented credential SAID>",
    "schemaSaid": "<credential schema SAID>",
    "txHash": "<Cardano tx hash of the CIP-170 ATTEST>"
  }
}
```

- Indexer: `IssuedCardEntity` gains `attestation_oobi`, `attestation_aid`, `attestation_credential_said`, `attestation_schema_said`, `attestation_tx_hash` (all nullable; a card is issued first, attested later). `CardIssuanceService.toCardJson`/`exportCard` emit the `attestation` block when present.
- Platform: `KeyCardDto` gains the matching nullable `attestation` sub-record; `VaultKeyEntity`/`AddressbookEntryEntity` gain provenance columns for it.

## Part A — Indexer ceremony (`reeve-indexing-example`)

The indexer's own KERIA agent runs the ceremony against the user's Veridian wallet, then binds the result to the issued card.

- **A1. Card KERI fields + wire format** (contract above) + Flyway migration (V1.6+).
- **A2. Agent bootstrap + OOBI exchange (pair):** ensure the indexer has a **witnessed agent AID under a stable bran** (port `SignifyClientConfig`'s create-with-witnesses + `resolveBran` warn-on-empty). Expose the agent OOBI; resolve the wallet's OOBI (validate shape, resolve+verify contact) — port `KeriOobiService`.
- **A3. Credential presentation:** IPEX apply → wait for offer/grant (dual-path) → agree → grant → admit → fetch + validate the credential chain (reuse WS1's `KeriService`/`CredentialSchemaRegistry` for schema-aware validation) — port `KeriCredentialService`.
- **A4. Attestation:** freeze the card into a CIP-170 payload (digest of the card's canonical bytes), remotesign-anchor it in the wallet's KEL, verify the ixn seal (KEL floor, re-resolve OOBI before KEL read), submit the label-170 ATTEST tx via the indexer's own tx submitter, record `txHash` — port `KeriAttestService` + `Cip170MetadataFactory`.
- **A5. Ceremony state machine + REST + correlator:** a `CardAttestationCeremony` entity (pair→credential→attest states, DB-backed), the notification correlator (snapshot-exclude), and a `resource` controller (the indexer's user-facing convention) driving the wizard synchronously — port `CeremonyService`/`KeriNotificationCorrelator`/`KeriAttestationController`.
- **A6. Frontend wizard:** in the indexer's `card-issuance` module (`frontend/src/modules/card-issuance`), add an "Attest with your Veridian wallet" flow at the `isIssued` result screen — pair (agent OOBI QR + wallet OOBI paste) → present credential → attest → the card download now includes the `attestation` block.

## Part B — Platform import verification (`cf-reeve-platform`, `document_vault`)

On card import, if the card carries an `attestation` block, **verify it** (else keep today's trust-on-first-use for unattested cards).

- **B1. Card format:** `KeyCardDto` gains the nullable `attestation` sub-record; entities gain provenance columns (migration).
- **B2. Import verification:** a new **synchronous, no-ceremony verification facade** in `keri_attestation` (this doesn't exist yet — the primitives do): given `{oobi, aid, credentialSaid, schemaSaid, txHash}`, it (1) resolves the OOBI on the platform's KERIA (`KeriOobiService.refreshResolve`), (2) validates the presented credential is a valid, non-revoked chain issued to `aid` of the claimed schema (`CredentialChainValidator` + the schema policy), and (3) reads the on-chain CIP-170 ATTEST metadata for `txHash` (`readCip170Metadata`) and checks it anchors this card's digest under `aid` (mirror `KeriAuthBeginService#verifyExternal`'s `t`/`i`/`s` checks, ATTEST variant). `CardImportService`/`KeyCardVerifier` call it; a failed verification rejects the import (or flags the card unverified — decide in B2), a card with no attestation block imports as today.

## Out of scope

- Any indexer↔platform runtime communication (forbidden — the card file is the only channel).
- Re-attestation / revocation lifecycle of an attested card (attest-once for now).
- Changing WS1's verification of externally-observed on-chain attestations.

## Tasks (order)

A1 (card fields + format) → A2 (agent + OOBI pair) → A3 (credential presentation) → A4 (attestation) → A5 (ceremony state machine + REST + correlator) → A6 (frontend wizard) → B1 (platform card format) → B2 (platform import verification). Each ends green on its repo's build/test (indexer JDK 21 / npm; platform JDK 21).
