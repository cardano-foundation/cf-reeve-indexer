# Indexer Document Vault Extension — Design

**Date:** 2026-07-14
**Status:** Draft for review
**Contract:** `docs/documentVault.md` (frozen, v4) — §9 is the normative design for this work; §2.1 (crypto constants), §2.6 (decrypt flow), §2.7 (invariants), §2.8 (key cards) bind it too.
**Repo:** `cf-reeve-indexer` (this repo) — backend `org.cardanofoundation.reeve.indexer` + `frontend/`. A separate deployable from Reeve; stays that way.

## 1. Goal

Extend this repo into the independent verifier for published Document Vault documents:

1. **Index** every label-1447 transaction of `type: DOCUMENT` from Cardano L1 (§9.2).
2. **Verify** the five §9.3 checks and expose honest verdicts.
3. **Serve** the public read API (§9.6): document list, detail, envelope proxy.
4. **Issue key cards** (§9.4/§2.8): browser-generated keypair, backend signs the public part only, registry of issued cards (public parts only).
5. **Frontend**: verification + in-browser decrypt views (no login), card issuance view (authenticated).

Non-goals: per-org publisher keys (§9.3 limit (b) — raised, deliberately out of scope), reading Reeve's database (forbidden by construction), any change to the frozen contract, envelope-v2 metadata-inside-payload.

## 2. The independence rule (drives everything)

The Indexer reconstructs everything from **Cardano L1 + IPFS alone**. It has no connection, credential, or client for Reeve's database or API, and this design adds none. The only artefact that flows outward is a signed key card, and it carries no secret.

Corollaries:
- Hostile on-chain input is the normal case, not an edge case: anyone can post label-1447 metadata claiming any org. Ingestion must never crash on garbage, and forged data must index as a **warning** (`PUBLISHER_UNKNOWN`), never as a document.
- Private keys exist only in browser memory (I1/I5). The backend signs card **public parts**; the issuance request schema has no private-key field and the handler rejects any request smuggling one.

## 3. What exists today (verified against source)

- Pipeline: `ReeveMetadataStorage` (extends yaci-store `TxMetadataStorageImpl`) filters `reeve.label: 1447`, Jackson-parses the body via `ReeveMetadata` → `ReeveMetadataDeserializer` (type switch on `ReeveTransactionType`: `REPORT, INDIVIDUAL_TRANSACTIONS, REPORT_V2, FUNDING`), injects `txHash` + `metadataHash`, dispatches through `ReeveTypeProcessorRegistry` → `ReeveTypeProcessor`. `FundingEventProcessor` is the reference implementation (inline data or IPFS manifest via `IpfsGatewayClient`).
- `TxMetadataLabel` carries `txHash`, `slot`, `label`, `body` (JSON), `cbor` (hex).
- yaci-store 0.1.6 publishes `TransactionEvent` with `com.bloxbean.cardano.yaci.helper.model.Transaction`: `txHash`, `slot`, `blockNumber`, `body` (inputs/outputs), `witnesses` (→ `VkeyWitness.getKey()` = signing vkeys), `auxData` (→ detect label-1447 txs); `EventMetadata` has `slot`, `blockTime`.
- `cardano-client-address:0.6.6` (transitive) parses bech32 addresses → payment credential; `cardano-client-crypto:0.6.0` provides blake2b.
- Persistence: Postgres, Flyway at `src/main/resources/db/store/postgresql/` (latest `V1.2__add_funding_events.sql`), schema `indexer`, snake_case Jackson.
- **No Spring Security** — issuance auth is new infrastructure.
- Frontend: React 18 + Vite + MUI v7 + TanStack Query v5; module conventions per `frontend/documentation/DEVELOPMENT.md`; public (no auth today); no crypto usage yet; Vitest.
- Reeve platform status (cross-checked in `cf-reeve-platform`): `document_vault` is scaffolding only — **no card verifier, no KAT, no `DocumentMetadataSerialiser` exist yet**. The DOCUMENT manifest shape below is the one proposed in Reeve's design spec and matches §9.2. **This repo therefore authors the golden vectors as the shared artifacts** (`docs/vectors/`); the Reeve team consumes them ("share the vector, do not write it twice").

## 4. On-chain manifest and IPFS envelope (the input formats)

Manifest — standard 1447 envelope, `type: DOCUMENT` (source: Reeve design spec `2026-07-13-document-vault-module-design.md`, consistent with contract §9.2/§9.3; snake_case, like all existing types):

```json
{ "1447": {
    "org": { "id": "…64-hex…", "name": "…", "currency_id": "…", "country_code": "…", "tax_id_number": "…" },
    "metadata": { "creation_slot": 12345, "timestamp": "2026-07-14T10:15:30Z", "version": "1.0" },
    "type": "DOCUMENT",
    "data": {
      "id": "<documentId, server UUID>",
      "ipfs_cid": "<CID of the envelope document>",
      "content_hash": "<64 hex — SHA-256(ciphertext)>",
      "plaintext_hash": "<64 hex — SHA-256(plaintext)>",
      "envelope_version": 1,
      "slot_count": 2
    } } }
```

IPFS envelope document (contract §3, PII-free):

```json
{ "version": 1, "type": "REEVE_ENCRYPTED_DOCUMENT", "org_id": "…",
  "content_hash": "…64 hex…", "plaintext_hash": "…64 hex…",
  "payload": { "ciphertext": "<base64>", "nonce": "…24 hex…" },
  "slots": [ { "ephemeral_pub": "…64 hex…", "wrapped_dek": "…96 hex…" } ] }
```

**Risk, stated:** the manifest `data` shape is not yet committed to Reeve's `docs/onChainFormat.md`. It matches §9.2 field-for-field, and the deserialisation is isolated in one small class, but if Reeve's implementation drifts, that class changes. Flagged as a cross-team dependency; do not silently adapt — the contract is frozen.

## 5. Backend design

Everything follows the repo's layer-per-package layout (`controller` / `service` / `processor` / `model.*` / `config`).

### 5.1 Ingestion

- `ReeveTransactionType.DOCUMENT` — new enum value.
- `ReeveMetadataDeserializer`: `case DOCUMENT` keeps `data` as the **raw `JsonNode`** — deliberately lenient, because §9.3 requires a malformed manifest to index as a `MALFORMED_MANIFEST` row, not to vanish in a parse error. Validation lives in the processor.
- `ReeveMetadataStorage`: propagate `metadata.getSlot()` into `ReeveMetadata` (new `slot` field) next to the existing `txHash` injection. **Targeted robustness fix**: `handleReeveTxs` currently NPEs on a manifest with no `org` section (`rawMetadata.getOrg().getId()`), which would let one hostile tx break the whole block batch — guard it (skip the org upsert, still dispatch), since hostile input is this service's threat model.
- `DocumentProcessor implements ReeveTypeProcessor` (`supportedType() == DOCUMENT`), modeled on `FundingEventProcessor`:
  - Validates the manifest `data` node: required `id`, `ipfs_cid`, `content_hash` (64 lowercase hex), `plaintext_hash` (64 lowercase hex), `envelope_version` (int ≥ 1), `slot_count` (int ≥ 1). Any miss → row with `MALFORMED_MANIFEST`.
  - Upserts one `reeve_document` row per tx (unique by `tx_hash`) with **merge-on-identical** reprocess semantics: a re-seen tx whose manifest fields are byte-identical preserves the existing row's check states and verdict (a mere replay can never regress a VERIFIED row); genuinely different fields rebuild the row fresh. Duplicate `document_id` across different txs is allowed and expected under forgery; the read API surfaces duplicates rather than hiding them. Rows carry `@Version` optimistic locking so concurrent check-writers cannot clobber each other.
  - Kicks the verification service (below) for the fresh row.

### 5.2 Verification (§9.3) — when and how each check runs

Stored per row: five per-check statuses (`PASS` / `FAIL` / `PENDING`) plus an overall `verdict`: `VERIFIED | MALFORMED_MANIFEST | PUBLISHER_UNKNOWN | IPFS_UNAVAILABLE | CONTENT_HASH_MISMATCH | MALFORMED_ENVELOPE | PENDING` (first failing check in §9.3 order wins; `PENDING` while publisher/IPFS are unresolved).

| # | Check | Mechanism |
|---|---|---|
| 1 | Anchor exists / manifest parses | `DocumentProcessor` validation at ingest (the row exists ⇒ the tx is on-chain). |
| 2 | Publisher is known | **Witness-signature check.** `TxSignerListener` (`@EventListener(TransactionEvent)`) records, for every tx whose `AuxData` carries label 1447, a `reeve_tx_signer` row: `tx_hash`, `slot`, `block_time`, and the blake2b-224 hashes of all `VkeyWitness` keys. `PublisherVerifier` passes iff any witness key-hash equals the payment credential of an address in the configured allowlist (`indexer.publisher.addresses`, parsed with `cardano-client-address` at startup — malformed entry fails startup, per the §9.5 philosophy). Empty allowlist ⇒ every document is `PUBLISHER_UNKNOWN` (loud startup warning). |
| 3 | IPFS resolves | `EnvelopeVerifier` fetches `ipfs_cid` through `IpfsGatewayClient`. |
| 4 | Chain ↔ IPFS integrity | `SHA-256(base64-decode(payload.ciphertext))` equals on-chain `content_hash`. |
| 5 | Envelope well-formed | Parses at declared `envelope_version` (v1 only; unknown version = fail, I7), `type == REEVE_ENCRYPTED_DOCUMENT`, field shapes (hex lengths, base64), `slots.length == slot_count`. |

**Why witness keys and not tx inputs/outputs:** an output to the organiser address is trivially forgeable (anyone can send to it); resolving *input* addresses depends on local UTXO-store completeness. A vkey witness is the actual Ed25519 signature over the tx — hashing it and comparing to the allowlisted address's payment credential proves the deployment's wallet signed, from data yaci-store hands us directly. (Alternatives considered and rejected: change-output heuristic — forgeable; input resolution — weaker operationally.)

**Ordering between metadata storage and `TransactionEvent`** is not guaranteed, so publisher resolution is event-driven from both sides and idempotent: `DocumentProcessor` looks up an existing signer row at insert; `TxSignerListener` resolves any unresolved document rows for its tx after saving. No scheduler needed for check 2.

**IPFS is retried, not condemned:** checks 3–5 run at ingest; on fetch failure the row stays `ipfs=PENDING` and a scheduled task (`@Scheduled`, e.g. every 5 min, exponential per-row backoff, attempts capped at ~12) retries; after the cap the verdict becomes `IPFS_UNAVAILABLE` but retries continue at low frequency — the honest reading of "the CID fetches through the gateway" is time-dependent. (Alternatives: verify-on-read — slow and DoS-able; one-shot — dishonest about gateway flakiness.)

**IPFS work is spent only on KNOWN publishers, and every fetch is bounded.** The scheduler selects an IPFS-retry row only when `publisher=PASS` (query `findByIpfsCheckAndManifestCheckAndPublisherCheck`), and `EnvelopeVerifier.verify()` re-checks the same condition before touching the gateway. A forged label-1447 anchor from an unknown wallet is `PUBLISHER_UNKNOWN` regardless of its IPFS state (publisher-FAIL wins in `DocumentVerdict.compute`), so it never drives a single gateway fetch — otherwise anyone posting Cardano metadata could point `ipfs_cid` at attacker-controlled content and force unbounded, repeated I/O through the independent verifier. Both the verifier and the read proxy fetch through the shared capped `IpfsGatewayClient.fetchBytes(cid, MAX_ENVELOPE_BYTES)` (15 MiB), so a single response can never be buffered without bound either.

**The two honest limits (§9.3)** are surfaced in API + UI copy verbatim: (a) `plaintext_hash` is *not checkable* without a key — only a key holder closes that link (the decrypt view does); (b) "publisher is known" attests the deployment's platform wallet, not the organisation — `PUBLISHER_UNKNOWN` rows render as warnings, never as documents.

### 5.3 Persistence — Flyway `V1.3__add_documents.sql`

- `reeve_document`: `tx_hash` (PK), `document_id`, `organisation_id`, `ipfs_cid`, `content_hash`, `plaintext_hash`, `envelope_version`, `slot_count`, `slot`, `block_time`, per-check status columns, `verdict`, `ipfs_attempts`, `ipfs_last_attempt`, `raw` (jsonb of the manifest data node), timestamps. Indexes on `organisation_id`, `document_id`.
- `reeve_tx_signer`: `tx_hash` (PK), `slot`, `block_time`, `vkey_hashes` (text[]).
- `reeve_issued_card`: `card_id` (uuid PK), `subject_type`, `subject_id`, `display_name`, `email`, `organisation_id`, `public_key`, `label`, `assurance`, `created_at` (the signed ISO instant), `issuer_id`, `signature` (128 hex). Unique `(subject_id, organisation_id, public_key)`. **Public parts only — no private key column exists.** PII here (name/e-mail) is deliberate and allowed: I10 forbids PII on IPFS/L1, not in the Indexer's own registry, and cards themselves carry it; the registry is served only on the authenticated endpoint.

### 5.4 Read API (public, §9.6)

`DocumentController`, no auth, matching the contract's §4 paged shape (`content/total/totalPages/page/size`) since the Indexer frontend consumes it:

- `GET /api/v1/documents?orgId=&verdict=&page=&size=&sort=` — paged index rows with verdicts. `orgId` optional (all orgs when absent). Sortable: `slot`, `blockTime`, `createdAt`. Hash-identified only: the view exposes ids, hashes, sizes (slot_count), dates, verdicts — **no file names, descriptions, or e-mails exist here** (I10 holds by construction: they never reach L1/IPFS).
- `GET /api/v1/documents/{documentId}` — detail: manifest fields + the five per-check results + verdict, for **every anchor** bearing that `document_id` (normal case: one; >1 is itself a forgery signal the frontend flags).
- `GET /api/v1/documents/{documentId}/envelope?txHash=` — proxies the envelope JSON from the IPFS gateway (spares the browser the CORS fight). `txHash` disambiguates duplicates (optional when unique). Pass-through, `Cache-Control: public, max-age=31536000, immutable` (CID-addressed content), size-capped (~15 MiB), 502 on gateway failure.

### 5.5 Card issuance (authenticated, §9.4 / §2.8)

- `POST /api/v1/cards/issue` — request: `subject { subjectType (REEVE_ACCOUNT|EXTERNAL), subjectId (required for REEVE_ACCOUNT — the holder's Keycloak `sub`; server-minted UUID for EXTERNAL), displayName, email, organisationId }`, `key { publicKey (64 lowercase hex), label }`. Server sets `assurance: "PORTABLE"` (Indexer-issued keys are portable by definition, §2.8.4 — not client-choosable) and `createdAt` (server clock, via the existing `ClockConfig` bean). Builds the §2.8.3 signing input, signs with the issuer Ed25519 key, persists the registry row, returns the **complete public card JSON** (`v:1`, `type: REEVE_KEY_CARD`, subject, key, issuer, signature). The client assembles handover cards (passphrase-wrapped private key) entirely client-side.
- **Private-key rejection, defense in depth:** the DTO has no private-key field, and the handler additionally scans the raw request JSON (recursively, all nesting levels) for any field NAME carrying private-key material → `400 CARD_CONTAINS_PRIVATE_KEY`. The match normalises case and word separators and rejects the `private` / `privkey` / `wrapped` tokens, so it catches `privateKey`, `private_key`, `private-key`, **`privateKeyHex`** (the frontend's raw-key property name), `privKey`, `wrapped`, and `wrappedPriv` alike — no legitimate issuance field name (`subjectType`, `subjectId`, `displayName`, `email`, `organisationId`, `publicKey`, `label`) contains those tokens, so it never rejects a well-formed request. Honest limit: it is a denylist of known NAMES, not a private-key detector — a raw 32-byte hex string is indistinguishable from a public key, so a value pasted into `publicKey` is not detectable. The frontend never offers a paste path for issuance (keys are generated in-browser; re-issue reads the registry).
- `GET /api/v1/cards?orgId=&subjectId=&page=&size=` — the registry (public parts + signature), paged. Re-issue = `GET /api/v1/cards/{cardId}/export` (authenticated) re-assembles the contact card server-side, cryptographically verifying the stored signature against the live issuer key first (`503 ISSUER_KEY_MISMATCH` on rotation) — never emitting a card that would fail the importer's check. `GET /api/v1/cards/status` (public) exposes only an `issuance_enabled` boolean so the UI can hide the view on unconfigured deployments. Both endpoints are additive to the §9.6 sketch. Issuing the same `(subjectId, organisationId, publicKey)` again is idempotent and returns the stored signature/createdAt verbatim.
- **Signing input (§2.8.3):** `CardSigningInputBuilder` — 4-byte big-endian length prefix per UTF-8 field, exactly 14 fields in contract order, absent optionals as `enc("")`. One class, no JSON canonicalisation anywhere near it.
- **Golden vector:** `docs/vectors/keycard-signing-vector-v1.json` — card fields, a test-only Ed25519 seed + public key, expected signing-input hex, expected signature hex. The backend KAT asserts both; the file is the shared artifact for Reeve's importer KAT.
- **Issuer key config (§9.5):** `indexer.issuer.id` + `indexer.issuer.signing-key` (64-hex Ed25519 seed, env-injected — *the single most sensitive secret in the system*; HSM/KMS is the deployment recommendation, documented). Signing uses BouncyCastle `Ed25519Signer` (verify exact artifact/version on classpath at implementation; add explicit dep if only transitive). Malformed key ⇒ fail startup. Absent ⇒ issuance disabled: endpoints return `503 CARD_ISSUANCE_UNAVAILABLE`.
- **Auth:** add `spring-boot-starter-security`. `SecurityFilterChain`: `permitAll` everywhere except `/api/v1/cards/**` → HTTP Basic, single operator principal from `indexer.issuance.username/password` (env). Missing creds ⇒ issuance disabled (503) rather than an unguessable default. Rationale: this deployable has no Keycloak and few operators; Basic-over-TLS with env creds is honest v1 with an OIDC upgrade path noted. Verification stays loginless — a verifier you must log into is not a verifier. Stateless sessions, CSRF disabled for the API (token-less Basic + no cookies).

### 5.6 Error shape

`ProblemDetail` (RFC 7807), `title` = machine code, consistent with the contract's §6 style:

| Title | Status | Meaning |
|---|---|---|
| `DOCUMENT_NOT_FOUND` | 404 | Unknown documentId, or a txHash naming no anchor of it. |
| `AMBIGUOUS_DOCUMENT_ID` | 400 | Several anchors claim this documentId — pass `txHash`. |
| `ENVELOPE_NOT_RECORDED` | 404 | The anchor has no CID recorded (malformed manifest) — retrying will never succeed. |
| `ENVELOPE_NOT_AVAILABLE` | 404 | The anchor is not from a known publisher (or verification is still unresolved) — its envelope is deliberately not served, so a forged `PUBLISHER_UNKNOWN` anchor cannot drive gateway I/O on demand. The detail endpoint still shows the row as a warning. |
| `ENVELOPE_UNAVAILABLE` | 502 | The IPFS gateway did not deliver — transient, retry-worthy. |
| `CARD_ISSUANCE_UNAVAILABLE` | 503 | No issuer signing key configured in this deployment. |
| `ISSUER_KEY_MISMATCH` | 503 | The stored card signature no longer verifies under the live issuer key (key rotated) — re-issuance/export refused rather than emitting a non-verifying card. |
| `CARD_CONTAINS_PRIVATE_KEY` | 400 | Issuance request smuggled key material (I5). |
| `INVALID_SUBJECT` / `INVALID_PUBLIC_KEY` | 400 | Subject/key validation failures. |
| `CARD_NOT_FOUND` | 404 | Unknown registry cardId on export. |

(`ENVELOPE_NOT_RECORDED` and `ISSUER_KEY_MISMATCH` were added during review: the former replaces a misleading 502 for permanently-CID-less anchors; the latter closes the §9.5 key-rotation gap where a re-issued card would silently carry a signature that no longer verifies against the emitted issuer key.)

## 6. Frontend design

Follows `frontend/documentation/DEVELOPMENT.md` conventions: modules with `view/components/hooks`, API factory in `libs/api-connectors/backend-connector-reeve/api/`, React Query wrappers in `libs/models/`, MUI + styled-components.

### 6.1 Crypto core — `src/libs/document-vault-crypto/`

The same core the Reeve frontend implements (§2.1/§2.6); constants in one file, KAT-tested:

- `constants.ts` — HKDF info strings (`reeve/document-vault/slot-kek/v1`), zero-nonce rule for slot unwrap (with the mandated comment), hex/base64 codecs.
- `decrypt.ts` — §2.6 steps 5–6: for each slot, `slotKEK = HKDF-SHA-256(X25519(priv, slot.ephemeral_pub), salt=∅, info, 32)`; trial `AES-256-GCM(slotKEK, zero nonce)` on `wrapped_dek` — **first GCM success is authoritative (I6)**; decrypt payload with DEK; recompute `SHA-256(plaintext)`; compare with the **on-chain** `plaintext_hash`; zero key material after use (I1).
- `cards.ts` — parse/validate card JSON; unwrap a handover card's private key: `PBKDF2-HMAC-SHA-256(passphrase, salt, iterations)` → AES-GCM unwrap; strip helper.
- `issue.ts` — X25519 keygen (`@noble/curves`), card assembly from the backend's signed response, client-side passphrase wrap (PBKDF2 600k iterations) for handover cards, JSON download.
- Primitives: WebCrypto for AES-GCM / HKDF / SHA-256 / PBKDF2; `@noble/curves` for X25519 (new dependency, per contract §2).
- **KAT:** `docs/vectors/crypto-kat-v1.json` — a complete fixture envelope (fixed DEK, fixed ephemeral keys, fixed nonces) + recipient keypair + expected plaintext + hashes, generated once by a script kept in-repo; the Vitest KAT decrypts the fixture through the real code path and must land byte-exact. Shared with the Reeve frontend team (their encrypt must produce envelopes this decrypt opens — one vector, two consumers).

### 6.2 Views

- **`modules/public-documents`** — route `/documents/:organisationId?`: paged list, verdict badges. `PUBLISHER_UNKNOWN` rows are rendered as a visually distinct **warning row** ("anchored by an unknown wallet — not attributable to this organisation"), never styled as a document. Page-level copy states the two honest limits. Verdict filter facets.
- **document detail** (same module) — route `/documents/:organisationId/detail/:documentId`: the five checks as a checklist with per-check status, manifest fields (hashes, CID, tx), explorer/IPFS links composed from frontend env (`VITE_EXPLORER_URL`, `VITE_IPFS_GATEWAY_URL` — §9.5: URL bases are frontend deployment config), duplicate-anchor warning, and the **decrypt panel**: drop a key card (or handover card + passphrase) → envelope fetched via the proxy → §2.6 in the browser → verdict incl. the plaintext-hash check ("the one check that ties ciphertext to a real file") → decrypted file download. Works with **no login** (route is public like the rest of the app).
- **`modules/card-issuance`** — route `/cards`: operator enters Basic credentials (kept in memory only); issue form (subject type with explicit REEVE_ACCOUNT-`sub` guidance — the one irreducibly manual step, with copy warning what a wrong `sub` costs; EXTERNAL for no-login holders); keypair generated in browser; contact/handover card download; registry table with re-issue-as-contact-card. Private key: **never rendered or copied to the clipboard** — it lives only in the issuance hook's ref and leaves the browser exclusively as a passphrase-wrapped handover card (§2.8.2), or is discarded; a payload-capture test asserts the issue request contains only the public key, and the hook never exposes the raw key on its public surface (I1/I5).

## 7. Testing

- Backend (JUnit 5 + Mockito, repo convention): deserialiser DOCUMENT cases (valid/malformed/missing org), `DocumentProcessor` (row shape, idempotency, malformed→verdict), `PublisherVerifier` (vkey-hash vs address credential, empty allowlist), `EnvelopeVerifier` (content-hash mismatch, slot-count mismatch, unknown version, bad base64), `CardSigningInputBuilder` **KAT against the golden vector**, issuance service (privateKey rejection, EXTERNAL uuid minting, disabled states), controller slices.
- Frontend (Vitest): crypto-core **KAT against `crypto-kat-v1.json`**, trial-decrypt fallback order, handover unwrap, card strip/assembly, issue-request payload capture (no private key), key hooks.
- Gates: `JAVA_HOME=$(/usr/libexec/java_home -v 21) ./gradlew test` and `npm test` real output shown before any "passes" claim; then code-reviewer subagent; then `/codex:adversarial-review` looped to AGREE, pointed at (a) §2.8.3 byte-layout vs the golden vector, (b) any code path leaking a private key to the backend.

## 8. Decisions log (alternatives considered)

| Decision | Chosen | Rejected because |
|---|---|---|
| Publisher check | Witness vkey-hash vs payment credential | Output heuristic: forgeable. Input resolution: depends on UTXO-store completeness. |
| Verification timing | Manifest checks at ingest; ALL gateway I/O (checks 3–5) owned by the scheduler — hostile/slow CIDs must not stall block ingestion; event-driven + scheduled publisher resolution | On-read: slow, DoS-able. One-shot: dishonest about IPFS transience. |
| Issuance auth | Spring Security HTTP Basic, env-configured operator | OIDC/Keycloak: no IdP in this deployable; documented as upgrade path. |
| Envelope serving | Stateless gateway proxy w/ immutable caching | DB persistence: MiB-scale bloat for content already content-addressed. |
| Malformed manifests | Indexed as `MALFORMED_MANIFEST` rows (lenient deserialise) | Dropping them: hides exactly what a verifier must surface. |
| Duplicate `document_id` | All anchors returned, flagged | Dedup/hide: masks a substitution/forgery signal. |
| Golden vectors | Authored here, shared via `docs/vectors/` | Waiting for Reeve's KAT: it does not exist yet (verified). |
