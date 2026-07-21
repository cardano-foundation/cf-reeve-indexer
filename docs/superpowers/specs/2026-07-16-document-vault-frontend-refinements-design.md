# Document Vault — Frontend Refinements

- **Date:** 2026-07-16
- **Branch:** `feat/document-module`
- **Status:** Approved (design)
- **Scope:** Frontend only (`frontend/`). No backend changes.

## Problem

Three usability gaps in the document-vault frontend, reported from the frontend view:

1. **No way back from a document detail page to the document list** — only the browser back button works.
2. **The card-creation feature is invisible and gated.** It is routed at `/cards` but has no entry point anywhere in the UI, and it sits behind an operator HTTP-Basic login. It must instead be **permissionless** and discoverable.
3. **The Issue Card form has no client-side validation** — and once card creation is client-side, the client is the *only* validator.

## Decisions (approved)

- **Permissionless, client-side card creation.** The card is built and downloaded **entirely in the browser** (passkey → public key → `KeyCard` JSON) with **no operator login and no authenticated POST** to the backend. The backend is untouched. Consequence: the `IssuerLogin` gate and the server-backed issued-cards `CardRegistry` (both of which required backend auth) are **removed**.
- **Subject is ALWAYS `EXTERNAL`.** The operator is never asked for a subject type or an account id: there is no subject-type selector and no subjectId field. `subjectType` is always `EXTERNAL` and `subjectId` is always machine-minted (`crypto.randomUUID()`). This designs out the "key minted into an account nobody owns" hazard entirely — there is no id to mis-type. `REEVE_ACCOUNT` remains part of the *wire format* (`buildCard`), but is unreachable from the UI.
- **Every operator-fillable field is optional — and labelled `(optional)`.** With subject type and subjectId gone, nothing is required: `displayName`, `email`, `organisationId` and `label` are all optional, so an empty form yields a valid minimal card (minted id + public key).
- **Refine, don't rebuild the form.** Keep the same subject/email/passkey form shape; change only its plumbing (assemble the card client-side instead of POSTing) and add validation.
- **Entry point:** an **"Issue key card"** button in the Documents list view, rendered **unconditionally** (independent of the selected organisation), so it shows even with no org chosen. **Not** added to the global sidebar/bottom-nav. Routing is not changed.
- **Back button:** a deterministic link that **always returns to the document list** (not `navigate(-1)`).
- **Email field:** **optional but validated**.

## Existing building blocks (verified)

- **Detail view:** `frontend/src/modules/public-document-detail/view/ViewPublicDocumentDetail.component.tsx` — reads only `documentId` from `useParams` (line 117); route is `documents/:organisationId/detail/:documentId`, so `organisationId` is available but unused.
- **Dormant primitive:** `LayoutPublic.Header.ButtonBack` (`frontend/src/libs/ui-kit/components/ButtonBack/ButtonBack.component.tsx`) — an `ArrowLeft` `IconButton` accepting `to`/`state`/`replace`. Currently unused, and its `to`/`state`/`replace` props are **inert**: they are spread onto a plain MUI `IconButton` that never renders as a link. Being its first consumer, this work fixes the primitive so the props it already declares actually work (see Change 1).
- **List view:** `frontend/src/modules/public-documents/view/ViewPublicDocuments.component.tsx`; copy in `frontend/src/modules/public-documents/constants/documents.consts.ts`. It renders inside `LayoutPublic.Main`, so content there shows whenever the view renders.
- **Route protection:** `frontend/src/routes/ProtectedRoute.tsx` is an **organisation gate** (redirects to `/` when no org is selected and none is in the URL) — not an auth gate. Left unchanged.
- **Card page:** `frontend/src/modules/card-issuance/view/ViewCardIssuance.component.tsx` — currently: `issuance_enabled` status gate → `IssuerLogin` (Basic auth) → `IssueCardForm` (POSTs via `useIssueCardModel`) + `CardRegistry` (GET issued cards). Route `ROUTES.CARD_ISSUANCE = 'cards'` / `PATHS.CARD_ISSUANCE = '/cards'`, not org-gated.
- **Form:** `IssueCardForm.component.tsx` + `IssueCardForm.hooks.ts` — `issue()` currently derives the keypair from a passkey, then POSTs `buildIssueRequest(...)` via `issueCardFn`. Copy in `frontend/src/modules/card-issuance/constants/issuance.consts.ts`.
- **Crypto lib:** `frontend/src/libs/document-vault-crypto/passkey.ts` (`createPasskeyAndDeriveKeypair`, `deriveCardKeyFromExistingPasskey` → `{ publicKeyHex, credentialId }`), `cards.ts` (`KeyCard` type + `parseCard`), `issue.ts` (`buildIssueRequest`, `downloadCardFile`).

### KeyCard format & validation rules (target for import-compatibility)

Client-side generation must produce this shape and enforce these rules (mirrors the backend's `CardIssuanceService.java`, which stays the source of truth for the *format*, even though we no longer call it):

| Field | Rule |
|---|---|
| top level | `v: 1`, `type: 'REEVE_KEY_CARD'` |
| `subject.subjectType` | `REEVE_ACCOUNT` \| `EXTERNAL` in the format; this UI always emits **`EXTERNAL`** |
| `subject.subjectId` | ≤255. The server used to mint a UUID for `EXTERNAL` → the client now mints one via `crypto.randomUUID()`. Never operator-entered |
| `subject.displayName` | optional, ≤255 (omit when blank) |
| `subject.email` | optional; if present: exactly one `@`, not at first/last position, ≤320 (omit when blank) |
| `subject.organisationId` | optional input, ≤64; always present in the card (`""` when org-less) |
| `key.publicKey` | 64 lowercase hex chars — derived from the passkey, not user-entered |
| `key.label` | optional, ≤255 (omit when blank) |
| `key.assurance` | `PASSKEY` (the form always derives from a passkey) |
| `key.createdAt` | ISO-8601 **second** precision, e.g. `2026-07-14T10:15:30Z` (client clock) |

## Change 1 — Back-to-list on document detail

**`ButtonBack.component.tsx`** (fix the primitive first — its declared `to`/`state`/`replace` are currently inert):
- When `to` is given, render `IconButton` with `component={RouterLink}` so the destination is a real anchor; without `to`, keep the plain icon button for onClick-driven callers.
- Its props must be **element-agnostic**: it cannot re-export `IconButtonProps` wholesale, because those handlers are typed to `HTMLButtonElement` and do not fit the anchor form (the MUI overload rejects the spread). Expose a `Pick` of the element-neutral props (`aria-label`, `className`, `color`, `disabled`, `edge`, `id`, `size`, `sx`) plus an `HTMLElement`-typed `onClick` and the router `to`/`state`/`replace`.

**`ViewPublicDocumentDetail.component.tsx`:**
- Destructure `organisationId` too: `const { organisationId, documentId } = useParams<{ organisationId: string; documentId: string }>()`.
- `const documentsListPath = organisationId ? \`/documents/${organisationId}\` : PATHS.PUBLIC_DOCUMENTS`.
- Render the back button beside the title (a flex `Box`, since `LayoutContentHeader` puts all children in one grid cell); the caller only passes `to`:
  ```tsx
  <LayoutPublic.Header>
    <Box alignItems="center" display="flex" gap={1}>
      <LayoutPublic.Header.ButtonBack aria-label={DOCUMENT_DETAIL_BACK_LABEL} to={documentsListPath} />
      <LayoutPublic.Header.Details description={...} title={...} />
    </Box>
  </LayoutPublic.Header>
  ```
- Import `PATHS` from `routes`.
- New copy constant `DOCUMENT_DETAIL_BACK_LABEL = 'Back to documents'` in `detail.consts.ts`.

## Change 2 — Permissionless, client-side card creation

Rework the card-issuance module so a card is produced entirely in the browser.

**`libs/document-vault-crypto/cards.ts`** — add the inverse of `parseCard`:
- `buildCard({ subject, publicKeyHex, label, assurance?, createdAt }) → KeyCard` assembling `{ v: 1, type: 'REEVE_KEY_CARD', subject, key }` per the format table above. Blank optional fields are omitted; `organisationId` defaults to `''`.
- `buildCard` is **pure** — it takes a fully-resolved `subject` (subjectId already set) plus `createdAt`, so it is deterministic and unit-testable. `EXTERNAL` UUID minting and `createdAt` are supplied by the hook (below), never generated inside `buildCard`.
- A small `formatInstantSeconds(date) → string` helper (strip milliseconds from `toISOString()`), so `createdAt` matches the backend's second-precision format.

**`IssueCardForm.hooks.ts`:**
- `issue()` no longer POSTs. It derives the keypair from the passkey (unchanged), always sets `subjectType: 'EXTERNAL'` and mints `subjectId` via `crypto.randomUUID()`, computes `createdAt = formatInstantSeconds(new Date())`, then calls `buildCard(...)` and returns the `KeyCard`. Remove `credentials`, `issueCardFn`, `defaultIssueCard`, and the `useIssueCardModel` dependency.
- `IssueSubject` (`document-vault-crypto/issue.ts`) narrows to `{ displayName?, email?, organisationId? }` — `subjectType`/`subjectId` are no longer inputs, because both are now determined by the hook. A minted id is per-card, so two cards are two distinct holders.
- Keep the `idle → issuing → issued | error` state machine; "issuing" now covers passkey derivation + client-side assembly (both can throw — WebAuthn errors surface as before).

**`IssueCardForm.component.tsx`:**
- Remove the `credentials` prop. The result screen (derived public key + copy + **Download contact card**) stays as-is.

**`ViewCardIssuance.component.tsx`:**
- Remove `IssuerLogin` and all operator-credential/login state and the login-probe logic.
- Remove `CardRegistry` and its `useGetIssuedCardsModel` usage.
- **Keep** the public `issuance_enabled` status gate (`GET /api/v1/cards/status`, no auth) as a deployment feature toggle → when disabled, render `CARD_ISSUANCE_DISABLED_MESSAGE` as the whole view.
- Render `IssueCardForm` directly (no `credentials`).

**Cleanup (now-dead code to remove):** `IssuerLogin` component, `CardRegistry` component, `useIssueCardModel`, `useGetIssuedCardsModel`, and the `cardsApi.issueCard` / `getIssuedCards` / `exportCard` methods + their now-unused types (`IssuerCredentials`, `IssuedCards*`). `buildIssueRequest` (+ its spec) is superseded by `buildCard`. Keep `cardsApi.getStatus` and `useGetCardStatusModel`.

**Copy (`issuance.consts.ts`):** reword `CARD_ISSUANCE_PAGE_DESCRIPTION` and `PASSKEY_CARD_ISSUED_NOTE` to reflect client-side-only generation (no "reaches Reeve"/POST language); drop all `ISSUER_LOGIN_*` / login-verification copy.

## Change 3 — "Issue key card" entry point (unconditional)

`ViewPublicDocuments.component.tsx`:

- Add a right-aligned **"Issue key card"** button in a flex row with the existing verdict filter (filter left, button right), above the table. Uses the already-imported `useNavigate` → `navigate(PATHS.CARD_ISSUANCE)`.
- Rendered **unconditionally** — not gated on `selectedOrganisation`, `documents`, or fetch state.
- New copy constant `ISSUE_KEY_CARD_BUTTON_LABEL = 'Issue key card'` in `documents.consts.ts`.
- No changes to `NavigationSidebar` / `LayoutPublicBottomNavigation` or routing.

## Change 4 — Fields & validation on IssueCardForm

Client-side validation is now the *only* validation, so it is required, not a nicety.

- Add a pure helper `IssueCardForm.validation.ts` exporting per-field validators and `validateFields(fields) → Partial<Record<keyof IssueCardFields, string>>` (message per invalid field, absent when valid). `IssueCardFields` is `{ displayName, email, organisationId, label }` — no subject type, no subjectId.
- Rules (mirror the format table). Every field is optional and only validated when non-blank, so `validateFields({})` is valid:
  - `displayName`: ≤255. `email`: when non-empty, exactly one `@` not at first/last char, ≤320. `organisationId`: ≤64. `label`: ≤255.
  - Every optional field is **blank-checked before its length check**, exactly as the backend does (`isBlank()` first, length only for non-blank). A whitespace-only value is absent — never "too long" — so the client never rejects input the backend would have accepted.
- Wire into the form: `error` + `helperText` per `TextField`; `inputProps={{ maxLength: N }}` as a soft cap; `canSubmit` = "no validation errors" (replacing the subjectId-only check). Keep an error `Alert` for passkey/derivation failures.
- New message constants in `issuance.consts.ts`.

## Testing

- **Unit** — `IssueCardForm.validation.spec.ts`: email edge cases (`a@b` valid; `a@`, `@b`, `a@b@c`, 321 chars invalid; empty → valid), org 64 vs 65, label/displayName/subjectId lengths, subjectId required for `REEVE_ACCOUNT` only.
- **Unit** — `cards.spec.ts` / `buildCard` (deterministic inputs): blank optional fields omitted; org-less → `organisationId === ''`; `v`/`type`/`assurance` set; output round-trips through `parseCard`. `formatInstantSeconds` strips milliseconds to second precision. Hook-level test covers `EXTERNAL` minting a UUID `subjectId` while `REEVE_ACCOUNT` keeps the entered one.
- **Component** — `IssueCardForm` (mock passkey derivation, no network): produces + offers a downloadable card; submit disabled on invalid email, re-enabled once corrected.
- **Component/interaction** — `ViewPublicDocumentDetail` renders a back link with the correct `to`; `ViewPublicDocuments` renders the (unconditional) "Issue key card" button navigating to `/cards`.

## Out of scope

- No backend changes (the backend's Basic-auth issue endpoint simply goes unused by the frontend).
- No global sidebar/bottom-nav entry for `/cards`; no routing/`ProtectedRoute` changes.
- Committing the large pile of pre-existing staged work already on this branch.
