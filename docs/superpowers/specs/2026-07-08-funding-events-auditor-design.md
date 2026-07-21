# Funding Events Auditor Page — Design

**Date:** 2026-07-08
**Branch:** `feat/add-funding-events`
**Goal:** An auditor-facing page for Funding Events. Target audience: auditors and
financially-interested people. Show how much funding a company (organisation) received,
what was spent under which projects and milestones, and refunds — clear and legible.

## Scope

- New read-only aggregation endpoint on the existing `EventController`.
- New frontend page following the established three-layer data pattern, reusing
  `LayoutPublic`, the `ui-kit`, and `@mui/x-charts`.
- **Do not touch** anything unrelated to this view (existing search endpoints, the
  `EventBundle→FundingEvent` rename already in flight, etc.).

## Data model recap (existing, unchanged)

An organisation publishes a `FUNDING` metadata bundle containing events:
- **FUNDING** — carries `allocations` (project → optional sub-project → milestones →
  `allocatedAmount`). No inline amount/date. Event total = sum of milestone allocations.
- **SPENDING** — a single inline spend record (`amountRcy`, `amountFcy`, `vendor`,
  `spendingCategory`, `fxRate`, `hash`, `date`, `currency`). References its funding via
  `fundingId`/`fundingTx`/`fundingEntity`. *May* carry its own `allocations` naming the
  project/milestone the money was spent on.
- **REFUND** — references a `fundingId`; amount via the generic `totalAmount`.

`eventType` is free-text; `GrantEventType` = {FUNDING, SPENDING, REFUND}.
Amounts are `BigDecimal`, qualified per-event by `currencyId`/`currencyCustCode`.

## Decisions

1. **Spend attribution = best-effort.** Prefer a SPENDING event's own `allocation`
   (project + optional milestone). If absent, resolve via `fundingId` → the funding's
   projects: attribute only when that funding maps to exactly **one** project (unambiguous);
   otherwise mark the spend **unattributed** (still counted in totals). Milestone-level
   `spentAmount` is set only when the spend names a milestone.
2. **Single primary currency.** Assume one reporting currency per org. Pick the dominant
   (most frequent non-null) `currencyCustCode`; sum all amounts together.

## Backend

New endpoint on `EventController` (`/api/v1/events`):

```
GET /api/v1/events/audit/{organisationId}?dateFrom=&dateTo=  →  AuditSummaryView
```

- 404 (existing `ProblemDetail` pattern) if `organisationId` does not resolve to an org.
- `dateFrom`/`dateTo` (optional, ISO `yyyy-MM-dd`) filter **dated** events (spending);
  funding/refund (no date) are always included since they cannot be period-filtered.
- Aggregation computed in `EventService` (Java fold over the org's events; allocation
  joins make pure-JPQL aggregation awkward and volumes are per-org small). New repository
  method to fetch the org's events; no entity/schema changes.

New view DTOs (view package only):

- **`AuditSummaryView`**: `organisationId`, `organisationName`, `currency`,
  `totalFunded`, `totalSpent`, `totalRefunded`, `netRemaining` (= funded − spent − refunded),
  `fundingCount`, `spendingCount`, `refundCount`, `firstEventDate`, `lastEventDate`,
  `projects: List<ProjectAuditView>`, `spending: List<SpendingLineView>`.
- **`ProjectAuditView`**: `projectId`, `projectTitle`, `allocatedAmount`, `spentAmount`,
  `remaining` (= allocated − spent), `milestones: List<MilestoneAuditView>`.
- **`MilestoneAuditView`**: `milestoneId`, `milestoneTitle`, `allocatedAmount`, `spentAmount`.
- **`SpendingLineView`**: `date`, `vendor`, `spendingCategory`, `amount`,
  `projectId`, `projectTitle` (nullable — unattributed), `fundingId`.

Totals use each event's precomputed `totalAmount` (spending == `amountRcy`), grouped by
`GrantEventType`. An "Unattributed" pseudo-project aggregates spends that could not be
mapped to a project, so the per-project spent always reconciles with `totalSpent`.

## Frontend

New page (`modules/public-events-auditor/`), route `events/audit/:organisationId` wrapped
in `ProtectedRoute`, plus a nav entry. Data via `publicEventsApi.getEventAudit` →
`useGetEventAuditModel` (react-query) → page hook. Layout:

1. **KPI header** — Total Funded · Total Spent · Total Refunded · Remaining, color-coded,
   with event counts and the date range.
2. **Allocated vs. Spent chart** — grouped bar per project (`@mui/x-charts`).
3. **Per-project breakdown table** — Project | Allocated | Spent | Remaining, with
   milestones expandable underneath (allocated vs spent per milestone).
4. **Spending ledger** — dated line items (date, vendor, category, project, amount) for
   line-item auditing.

i18n via `useTranslations` + new keys in `en-US.json`. Formatting reuses `formatNumber`
and the `dayjs` date pattern already used by `EventDetail`.

## Out of scope

Multi-currency FX normalisation, editing/export, changes to the existing search/detail
flow, and any backend schema/entity changes.
