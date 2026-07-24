# Indexer: multi-schema KERI verification + document attestation + reusable badge — Design

**Date:** 2026-07-24
**Status:** Approved — implementing
**Repo:** `reeve-indexing-example` (branch `feat/document-module`) — backend + `frontend/`
**Workstream:** 1 of 2 (this spec). Workstream 2 — user attests a card via a full Veridian ceremony *in the indexer* + platform verifies on import — is a separate later spec.

## Goal

Make the indexer verify on-chain KERI label-170 attestations for **documents** the same way it already does for **reports**, show a **verified checkmark badge** on documents, and support **multiple credential schemas** (not just vLEI) via a per-schema trust registry. Generalize the report badge and reuse it for documents.

## Background (what exists)

- `ReeveMetadataStorage.saveAll` intercepts every tx metadata label. **Label 1447** (`reeve.label`) = business payload (reports, transactions, funding, DOCUMENTS); it blake3-digests the raw datum into `metadataHash`. **Label 170** (`keri.metadata-label`) = `IdentityMetadata{i(AID), s(seq), d(dataHash), c(credential chain hex CESR), t(IdentityType{ATTEST,AUTH_BEGIN,AUTH_END}), m(map)}`.
- **Report verification:** `AUTH_BEGIN` → `CredentialEntity` + `KeriService.verifyCredentialEntity` (parses CESR, verifies `vcp`/registry events, sets `valid`). `ATTEST` → `KeriService.verifyIdentityTx` (looks up a `ReportEntity` by txHash, checks `report.metadataHash == identity.dataHash`, then `verifyEvent` confirms the AID's KEL event at `seq` anchors that dataHash). Gate: KEL-verified **AND** credential present **AND** credential `valid` → `report.identityVerified = true`.
- **"vLEI-only" is by naming, not a schema check.** No schema SAID is validated anywhere. Trust = the flat global `keri.oobis` list resolved at startup. LEI-hardcoded seams: `CredentialMetadataMapper` (`m.LEI` key), `CredentialEntity.lei`, `LEIResponse.lei`, `keri.oobis`, frontend `useGLEIFVerification`. `CredentialEntity.labels` (from `m.l`) is captured but unused — a natural schema-id home.
- **Documents** (`DocumentEntity`/`reeve_document`, routed via `DocumentProcessor`) verify only IPFS content-integrity (`DocumentVerdict`); no `identifier`/`identityVerified`/`metadataHash`.
- **Frontend badge:** `IdentityVerificationStatus` (binary, LEI-hardcoded, GLEIF cross-check) in `public-reports`, driven by `ReportView.identities[].identityVerified` (`LEIResponse{identityVerified, lei, txHash, credentialTxHash}`). Documents have a content `VerdictChip`/`VerdictSummary` (multi-state, lookup-driven) but no identity badge.
- **No tests** exist for any KERI/credential/identity path.

## Design

### A. Per-schema trust registry (config)

Replace the flat `keri.oobis` with `keri.credential-schemas` — a list, each entry:

```yaml
keri:
  enabled: false
  metadata-label: 170
  url: ...
  bootUrl: ...
  credential-schemas:
    - said: "<vLEI leaf schema SAID>"
      name: "vLEI Legal Entity"
      chained: true
      trusted-roots: ["<GLEIF root AID>"]      # chain must terminate here
      trusted-issuers: []                        # unused when chained
      oobis: ["<GLEIF/QVI issuer + registry OOBIs>"]
    - said: "EL9oOWU_7zQn_rD--Xsgi3giCWnFDaNvFMUGTOZx1ARO"
      name: "Foundation Employee"
      chained: false
      trusted-roots: []
      trusted-issuers: ["<credential-server issuer AID>"]  # standalone: issuer must be trusted
      oobis: ["<issuer + registry OOBIs>"]
```

- `KeriProperties` gains `List<CredentialSchema> credentialSchemas` (record/class: `said, name, chained, trustedRoots, trustedIssuers, oobis`). Keep `oobis` deprecated-but-honored for one release (union all schemas' oobis + legacy `oobis` at startup resolution) to avoid a breaking config change.
- A `CredentialSchemaRegistry` bean indexes schemas by SAID and exposes `Optional<CredentialSchema> forSaid(String)`.
- `KeriConfig` resolves the union of all configured OOBIs at startup (unchanged mechanism, wider source).

### B. Generalize the credential model + verification

- `CredentialEntity`: add `schemaSaid` (String) and `claims` (JSON/text of the credential attribute block). Keep `lei` (nullable) populated from `claims["LEI"]` when present, for backward compatibility. Flyway migration adds the two columns.
- `CredentialMetadataMapper.toEntity`: stop special-casing `m.LEI`. Extract `schemaSaid` (from the credential's `s` in the parsed chain, or `m.s`) and store the whole attribute block as `claims`; still derive `lei` from `claims` when present.
- `KeriService.verifyCredentialEntity` becomes **schema-aware**:
  1. Determine the leaf credential's `schemaSaid`; look it up in `CredentialSchemaRegistry`. **Unknown schema → `valid=false`** (reject).
  2. Parse the CESR chain (existing `CESRStreamUtil.parseCESRData`).
  3. **Chained schema:** verify the chain terminates in one of `trustedRoots` (walk issuer→issuee links; verify each `vcp`/registry via `registries().verify`, as today, AND assert the terminal issuer AID ∈ `trustedRoots`). This adds the trust-root check that is missing today.
  4. **Standalone schema:** verify the leaf's issuer AID ∈ `trustedIssuers`, the credential's TEL shows `iss` and not `rev` (not revoked), and the issuee matches the presenting AID (`IdentityMetadata.i`).
  5. Set `valid` from the actual check outcome (not "non-empty"). Isolate exceptions per-credential (catch → `valid=false` + log) so one bad tx doesn't abort the metadata batch (mirror the 1447 processor's per-item isolation).

### C. Label-170 verification for documents

- `DocumentEntity`/`reeve_document`: add `metadataHash` (String), `identifier` (String, AID, nullable), `identity_verified` (boolean, default false). Flyway migration.
- `ReeveMetadataStorage.handleReeveTxs` (the 1447 path, `DocumentProcessor`): persist the document's `metadataHash` (already computed for the datum) on the `DocumentEntity`, same as reports.
- Generalize `KeriService.verifyIdentityTx`: on an `ATTEST` event, correlate by txHash across **both** `ReportRepository.findByTxHash` and `DocumentRepository.findByTxHash`; for whichever matches, compare `metadataHash == dataHash`, run `verifyEvent`, gate on credential `valid`, and set `identityVerified` on the matched entity. (Extract the shared gate so report and document paths share it.)
- Surface identity verification on the document API: add `identities: List<IdentityAttestationView>` (see D) to `DocumentView`/`DocumentDetailResponse`, assembled in `DocumentService` the same way `ReportService` builds `ReportView.identities` (load credential by identifier, project schema/claims). Expose via existing `DocumentController` (`GET /api/v1/documents`, `/{id}`).

### D. Generic verified-identity DTO + reusable badge

- Rename/replace `LEIResponse` with a generic `IdentityAttestationView` (backward-compatible superset): `{ identityVerified, aid, schemaSaid, schemaName, claims (map), lei (nullable, derived), txHash, credentialTxHash }`. `ReportView.identities` and the new `DocumentView.identities` both use it.
- **Frontend (`reeve-indexing-example/frontend`):**
  - Extract `IdentityVerificationStatus` into a shared, schema-aware component (move out of `public-reports/components` into a shared `components/`): props `{ isVerified, schemaName, schemaSaid, claims?, lei?, txHash?, credentialTxHash? }`. Show the **schema name** as the primary label; run the GLEIF cross-check (`useGLEIFVerification`) **only when a `lei` is present** (i.e. the vLEI schema), never for other schemas.
  - Update the TS type (`publicReportsApi.types.ts` `LEIResponse` → generic) with `schemaSaid`/`schemaName`/`claims`.
  - Mount the badge on **documents**: in `public-documents` list (`ViewPublicDocuments`) and `public-document-detail`, as a **separate** column/element from the existing content `VerdictChip`/`VerdictSummary` (identity-attestation and content-integrity are distinct claims). Add the `identities` field to the documents API type/connector.

### E. Testing

The KERI paths have **zero** coverage. Add:
- Backend unit tests: `CredentialSchemaRegistry` (lookup, unknown); `verifyCredentialEntity` (chained vLEI accepted w/ trusted root; standalone demo accepted w/ trusted issuer + not-revoked; unknown schema rejected; wrong issuer rejected; revoked rejected); `verifyIdentityTx` generalized (report match, document match, hash-mismatch rejected, credential-invalid gate). Use CESR/KEL test fixtures (see `docs/vectors`).
- Frontend: badge renders verified/unverified, shows schema name, GLEIF only for vLEI; documents list/detail mount the identity badge.

## Out of scope (this spec)

- Workstream 2 (attest-a-card ceremony in the indexer + platform import verification).
- Deep KEL/TEL cryptographic signature verification beyond what `signify-java`/KERIA already do inside `registries().verify()` (documented limitation carried forward).
- Changing label numbers or the 1447 payload shape.

## Tasks (implementation order)

1. `KeriProperties` + `CredentialSchema` + `CredentialSchemaRegistry` + `application.yml` config (with vLEI + demo defaults); OOBI union resolution in `KeriConfig`.
2. `CredentialEntity` (schemaSaid + claims) + migration + `CredentialMetadataMapper` generalization.
3. `KeriService.verifyCredentialEntity` schema-aware (chained vs standalone) + per-item isolation.
4. `DocumentEntity` (metadataHash/identifier/identity_verified) + migration; store metadataHash in `DocumentProcessor` path; generalize `verifyIdentityTx` across reports+documents; shared gate.
5. `IdentityAttestationView` generic DTO; `DocumentService`/`DocumentController` surface `identities`; `ReportService` uses the generic DTO.
6. Frontend: generalize badge (shared, schema-aware, conditional GLEIF); update types/connector; mount on documents list + detail.
7. Tests (backend + frontend) per §E.

Each task ends with a green build/test on JDK 21 (backend) / `npm` (frontend).
