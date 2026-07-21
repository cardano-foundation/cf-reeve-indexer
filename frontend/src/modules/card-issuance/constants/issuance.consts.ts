/**
 * Copy and constants for the card creation view (§9.4). Card creation is PERMISSIONLESS and fully
 * CLIENT-SIDE: there is no login, the holder's keypair is DERIVED from a WebAuthn passkey created in
 * this browser, and the UNSIGNED card (no issuer, no signature) is assembled and downloaded here —
 * nothing is sent to the backend. Non-negotiable rules this module must uphold:
 *  1. issuance_enabled === false renders CARD_ISSUANCE_DISABLED_MESSAGE as the WHOLE view - no forms.
 *  2. Cards are ALWAYS for an EXTERNAL holder and their subjectId is machine-minted - the operator is
 *     never asked for a subject type or an account id, so a key can never be minted into the wrong one.
 *  3. Client-side validation mirrors the card rules - with no server round-trip it is the only check.
 *  4. Every field the operator can fill in is OPTIONAL, and is labelled as such.
 */

export const CARD_ISSUANCE_PAGE_TITLE = 'Card issuance'

export const CARD_ISSUANCE_PAGE_DESCRIPTION =
  'Create a key card for a holder. Everything happens in this browser: the keypair is derived from a passkey, only the public half is written into the card, and the finished card is downloaded here — nothing is sent to Reeve.'

// Shown as the WHOLE view when issuance is disabled on the deployment. No forms.
export const CARD_ISSUANCE_DISABLED_MESSAGE = 'Card issuance is disabled on this deployment'

export const ISSUE_CARD_FORM_TITLE = 'Issue a new key card'

// Every card created here is for an EXTERNAL holder: someone with no Reeve login, who decrypts
// published documents in the Indexer. Their subjectId is minted for them, so there is nothing to type
// and nothing to get wrong.
export const SUBJECT_EXTERNAL_GUIDANCE =
  'This card is for a holder without a Reeve login (an external auditor). They decrypt published documents here in the Indexer. Their identity is generated for them — everything below is optional and only describes the holder.'

export const DISPLAY_NAME_LABEL = 'Display name (optional)'

export const EMAIL_LABEL = 'Email (optional)'

export const ORGANISATION_ID_LABEL = 'Organisation ID (optional)'

export const ORGANISATION_ID_OPTIONAL_GUIDANCE =
  'Leave blank to issue an org-less card. It records an empty organisation and is not importable into an org addressbook — use it for an unaffiliated holder who only decrypts published documents.'

export const KEY_LABEL_LABEL = 'Key label, e.g. device name (optional)'

// Client-side validation messages. These mirror the backend's hand-rolled card rules (displayName/label
// ≤255, email shape + ≤320, organisationId ≤64) so the operator sees the problem inline before a card
// is assembled, rather than after the fact.
export const DISPLAY_NAME_TOO_LONG_MESSAGE = 'Display name must be at most 255 characters.'

export const EMAIL_INVALID_MESSAGE = 'Enter a valid email address (at most 320 characters).'

export const ORGANISATION_ID_TOO_LONG_MESSAGE = 'Organisation ID must be at most 64 characters.'

export const LABEL_TOO_LONG_MESSAGE = 'Key label must be at most 255 characters.'

// The two ways to supply the holder's passkey. 'create' registers a brand-new passkey on this
// device; 'existing' derives the public key from a passkey the holder already registered.
export const PASSKEY_MODE_LABEL = 'Holder passkey'

export const PASSKEY_MODE_OPTIONS: { value: 'create' | 'existing'; label: string }[] = [
  { value: 'create', label: 'Create a new passkey' },
  { value: 'existing', label: 'Use an existing passkey' }
]

// Button/label copy is mode-aware so the operator knows whether a NEW passkey will be registered or
// an EXISTING one will be selected before the WebAuthn prompt appears.
export const ISSUE_BUTTON_LABEL = 'Create passkey & issue'

export const ISSUE_BUTTON_LABEL_EXISTING = 'Use passkey & issue'

export const ISSUING_LABEL = 'Creating passkey & issuing…'

export const ISSUING_LABEL_EXISTING = 'Reading passkey & issuing…'

export const ISSUE_ERROR_FALLBACK_MESSAGE = 'Card issuance failed.'

// Shown next to the issue action when creating a NEW passkey: it must be created on the device the
// holder will decrypt from, because the private key is re-derivable ONLY from that passkey.
export const PASSKEY_ISSUANCE_GUIDANCE =
  'Clicking issue creates a passkey on THIS device and derives the keypair from it. Create it on the device the holder will decrypt from — the private key exists nowhere else and cannot be recovered without that passkey.'

// Shown next to the issue action when using an EXISTING passkey: the holder picks a passkey they
// already registered, and the SAME public key is re-derived from it — no new credential is created.
export const PASSKEY_EXISTING_GUIDANCE =
  'Clicking issue asks you to pick a passkey already registered on this device and derives the public key from it. Use the passkey the holder decrypts with — the private key never leaves that passkey.'

// Shown after a successful issue: the card is unsigned, public-only, and no key was retained.
export const PASSKEY_CARD_ISSUED_NOTE =
  'This card is unsigned and carries only the public key. The holder decrypts by selecting the passkey used here — the private key was never shown, copied, sent, or stored.'

// The derived public key is safe to share in the open — it is the only thing anyone needs to encrypt
// a document TO this holder. Surfaced on the result screen so the operator can copy it directly.
export const DERIVED_PUBLIC_KEY_LABEL = 'Public key (safe to share)'

export const COPY_PUBLIC_KEY_LABEL = 'Copy'

export const COPY_PUBLIC_KEY_DONE_LABEL = 'Copied'

export const CONTACT_CARD_DOWNLOAD_LABEL = 'Download contact card'

// Reassures the operator the downloaded file is the complete, ready-to-import card (public-only).
export const CONTACT_CARD_DOWNLOAD_NOTE =
  'The downloaded .json is the complete card — hand it to the holder or import it into an org addressbook as-is.'

export const ISSUE_ANOTHER_BUTTON_LABEL = 'Issue another card'

// The downloaded file name is id-based (never display name / email - PII stays out of filenames).
export const buildContactCardFileName = (cardId: string) => `key-card-${cardId}-contact.json`
