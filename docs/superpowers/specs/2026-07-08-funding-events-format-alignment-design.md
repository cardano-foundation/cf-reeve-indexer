# Funding Events — On-Chain Format Alignment

Date: 2026-07-08
Branch: `feat/add-funding-events`

## Goal

Align the funding-events indexer (backend + frontend) with the authoritative
Reeve on-chain metadata format for the `FUNDING` type, as defined in
`cf-reeve-platform` `release/1.6.0`:

- `docs/onChainFormat.md`
- `blockchain_common/.../spending_event_blockchain_transaction_metadata-schema.json`
- `blockchain_publisher/.../SpendingEventMetadataSerialiser.java`

## Ground truth (what actually goes on-chain, label 1447)

Top-level envelope:

```json
{ "1447": { "org": {…}, "metadata": { "creation_slot", "timestamp", "version": "1.0" },
            "type": "FUNDING", "data": [ …events… ] } }
```

Grant event object (fields inline on the event, `oneOf` grant/custom):

- `id`, `type` (`FUNDING|SPENDING|REFUND`), `funding_tx?`, `funding_id`, `funding_entity?`
- Spend fields (SPENDING): `amount_rcy`, `amount_fcy`, `vendor`, `spending_category`,
  `fx_rate`, `hash`, `notes`, `date`, `currency` = `{ id, cust_code }`
- `allocation[]` (required, minItems 1)

Custom event: `id`, `type` (non-reserved), `date`, + free-form body.

Allocation (`oneOf` direct / sub-project):

- `project_id`, `project_title`
- Direct: `milestones[]`
- Sub-project: `sub_project` = `{ sub_project_id, sub_project_title?, milestones[] }`

Milestone: `milestone_id`, `milestone_title`, `allocated_amount?`.

IPFS manifest (value of `data` when not inline): `id`, `ipfs_cid`, `interval`
(`DAILY|WEEKLY|MONTHLY|QUARTERLY|YEARLY`), `date`, `event_count`. Off-chain doc:
`org_id`, `currency_id`, `version`, `date`, `events[]`.

## Discrepancies fixed

1. Type discriminator `EVENT_BUNDLE` → `FUNDING`.
2. Spend fields were modelled as a nested `item[]` array; they are inline on the
   event (single spend record). Move them onto the event.
3. Milestone amount key `amount_rcy` → `allocated_amount`.
4. Sub-project was flattened (`sub_project_title` + `milestones`); it is a nested
   `sub_project` object. Model `sub_project_id` + `sub_project_title` + `milestones`.

## Decisions

- **Spend storage**: inline on `reeve_event` / `EventEntity` / `EventView`. Drop
  `reeve_event_item`, `EventItemEntity`, `EventItemView`, `EventItem`.
- **Naming**: rename `EVENT_BUNDLE` → `FUNDING`; `EventBundleEvent` → `FundingEvent`,
  `EventBundleProcessor` → `FundingEventProcessor`, tests likewise. `Event*` entity/
  view/service/controller names and `reeve_event*` tables keep their names.
- **IPFS**: support the manifest object in `data` only (existing behaviour); ignore
  the platform's flat top-level `ipfs` key quirk.

## Change surface

Backend: `ReeveTransactionType`, domain `event/*` (rename + restructure), entities
(`EventEntity`, `EventAllocationEntity`, `EventMilestoneEntity`; delete
`EventItemEntity`), views (`EventView`, `EventAllocationView`, `EventMilestoneView`;
delete `EventItemView`), `FundingEventProcessor`, `ReeveTypeProcessorRegistry`,
`ReeveMetadataDeserializer`, `EventService`/`EventController`/`EventRepository`/
`EventSearchRequest` as needed, Flyway migration `V1.2` (edit in place — unreleased),
and tests.

Frontend: `publicEventsApi.types.ts` (drop `EventItemView`, add inline spend fields,
`allocatedAmount`, `subProjectId`), `EventDetail.component.tsx` (replace Line Items
section with inline spend details), translations as needed.

## Verification

`test-runner` on the backend Gradle module (Java 21) and a frontend type-check/build;
then `code-reviewer` on the diff.
