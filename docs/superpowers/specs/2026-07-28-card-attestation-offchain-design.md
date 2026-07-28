# Card attestation without on-chain publishing — Design

**Date:** 2026-07-28
**Status:** Approved — implementing
**Repo:** `reeve-indexing-example`
**Supersedes:** the on-chain parts of `2026-07-24-indexer-veridian-card-attestation-design.md` (A4/A5 tx submission)

## Goal

Attesting a card must **not publish anything to Cardano**. The indexer is a chain **reader** — it syncs
from a node via `yaci-store` and must have no tx-submission capability of its own. The attest-with-Veridian
ceremony keeps its cryptographic value; it just stops broadcasting.

Two problems this fixes:

1. **The ceremony is unusable as shipped.** `CardAttestService` fails every attest step with
   `ATTEST_SUBMITTER_UNAVAILABLE` unless `keri.attestation.submitter.enabled=true` — which additionally
   demands a funded organiser wallet mnemonic and a Blockfrost project id. With the default config, a
   card can be paired and can present a credential, but can never be attested.
2. **The replacement proof was never wired up.** `V1.10__add_card_attestation_kel_anchor.sql` already
   added `attestation_kel_sequence` / `attestation_kel_event_said` / `attestation_metadata_label` /
   `attestation_card_digest` / `attestation_payload_said` to `reeve_issued_card`, documenting them as
   the chain-independent proof. Nothing ever writes those columns and `CardIssuanceService#toCardJson`
   never emits them, so they are dead. This design finishes that migration's intent.

## What the attestation is, without the chain

The wallet's **KEL interaction (ixn) event is the attestation**. The on-chain ATTEST tx was only ever a
second copy of a fact the wallet had already signed: the ceremony sends a remotesign request, the wallet
anchors the payload SAID in its own KEL, and `CardAttestService` verifies that seal (KEL floor, explicit
candidate, re-resolve-before-read) *before* it ever submitted a tx. Dropping the tx drops a redundant
publish, not the proof.

What an importer holding only the card file can verify, per V1.10's own recipe:

1. recompute `cardDigest`  = Blake3-256(canonical CBOR(card JSON MINUS the `attestation` block))
2. recompute `payloadSaid` = `saidify({i: aid, d: "", metadataLabel, metadataDigest: cardDigest}).d`
3. resolve `oobi` → fetch the KEL for `aid`
4. find the `ixn` event at `kelSequence`, confirm its own SAID equals `kelEventSaid`
5. assert that event's seal anchors the recomputed `payloadSaid`
6. validate `credentialCesr` (the presented credential chain) is issued to `aid`, unrevoked, of `schemaSaid`

`cardDigest` and `payloadSaid` stay **informational only** — a verifier MUST recompute both (steps 1–2)
and compare. Trusting them as given makes step 5 vacuous, since the same party supplied the claim and the
value it would be checked against.

## The card-format contract (revised)

`attestation.txHash` is **removed**. The block becomes:

```json
"attestation": {
  "oobi": "https://.../oobi/<walletAid>/agent/<agentEid>",
  "aid": "<wallet AID that attested>",
  "credentialSaid": "<presented credential SAID>",
  "schemaSaid": "<credential schema SAID>",
  "kelSequence": "<hex seq of the anchoring ixn event>",
  "kelEventSaid": "<SAID of that event>",
  "metadataLabel": "170",
  "cardDigest": "<informational: the digest this indexer computed>",
  "payloadSaid": "<informational: the payload SAID the wallet anchored>",
  "credentialCesr": "<full CESR chain of the presented credential>"
}
```

Absent block = unattested card (unchanged, still valid). `metadataLabel` is a **string**, not a number:
it is fed to the payload SAID as a string (`RemotesignRequestFactory` receives `String.valueOf(label)`),
so persisting the exact string removes numeric-formatting ambiguity when the importer rebuilds the payload.

## Changes

**Removed entirely (the submitter):**
- `service/CardTxSubmitter.java`, `service/OrganiserWalletCardTxSubmitter.java`,
  `service/CardTxSubmissionException.java`
- `config/CardAttestationSubmitterConfig.java`, `config/CardAttestationSubmitterProperties.java`
- `keri.attestation.submitter.*` in `application.yml` (and its `ATTEST_*` env vars)
- the `cardano-client-backend-blockfrost` dependency in `build.gradle.kts` — added solely for this
- `Cip170MetadataFactory#attestMap` (only the tx consumed it; `digestOf` stays — the card digest needs it)
- `CardTxSubmissionException` → 502 mapping in `CardAttestationExceptionHandler`
- `reeve_issued_card.attestation_tx_hash` and `reeve_card_attestation_ceremony.tx_hash` (migration V1.12)

**`CardAttestService`:** no submitter dependency, no fail-fast submitter check, no tx submission. The
**tx-only resume path** goes away with it — it existed solely to retry a failed broadcast without redoing
the wallet round trip; with no broadcast there is no partial state to resume. Once the anchor verifies,
the step persists it, advances `CREDENTIAL_RECEIVED → ATTEST_ANCHORED`, and binds the card in one pass.
The double-submit and abandoned-resume caveats that method's javadoc carried are resolved by deletion.

**`CardIssuanceService#toCardJson`:** emits the KEL anchor fields, drops `txHash`.

**Frontend:** `AttestedKeyCard.attestation` types follow the contract above; the wizard's success screen
shows the KEL anchor instead of a tx hash; copy stops saying "on-chain" / "anchors it on Cardano".

## Out of scope

- The platform's (`cf-reeve-platform`) B2 import verification — it consumes this contract but is a
  separate repo/task. Its verification of the on-chain ATTEST tx for **reports and documents** is
  unaffected; only cards stop being published.
- The indexer's existing READ path for label-170 metadata (`ReeveMetadataStorage`, `KeriService`) — it
  keeps verifying externally-observed on-chain attestations. Nothing there submits.
