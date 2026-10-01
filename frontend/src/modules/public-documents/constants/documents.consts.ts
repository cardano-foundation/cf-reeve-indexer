import type { DocumentVerdict } from 'libs/api-connectors/backend-connector-reeve/api/documents/documentsApi.types'

/**
 * Copy and constants for the public, org-scoped documents list. The two non-negotiable UI rules
 * this module must uphold:
 *  1. The list is identified by hash, not by file name: the original name is personally identifying
 *     and is deliberately never published, so there is none to show.
 *  2. The HONEST_LIMIT_VERIFIED_MEANING sentence is stated verbatim on the page via the HonestLimits component.
 */

export const DOCUMENTS_PAGE_TITLE = 'Documents'

export const DOCUMENTS_PAGE_DESCRIPTION = 'Hash-identified, independently verified anchors of encrypted documents published on-chain by this organisation.'

// The honest-limit sentence, shown verbatim.
export const HONEST_LIMIT_VERIFIED_MEANING =
  'VERIFIED means: the bytes on IPFS are exactly the bytes this organisation anchored on Cardano. It does NOT check the encrypted content against a real file — only a key holder can do that, by decrypting.'

// Placeholder id shown for anchors that failed before a document_id could be assigned.
// This is NOT a file name; it is derived from the anchor transaction hash.
export const MALFORMED_ANCHOR_LABEL = 'Malformed anchor'

// Columns are chosen for scanning a list, not for auditing a single row. The content hash lives on
// the detail page instead: 64 hex characters cannot be compared by eye, so as a column it only added
// width. The Cardano slot rides along under the anchor date rather than taking a column of its own,
// since both describe the same block.
export const DOCUMENTS_TABLE_COLUMNS = {
  documentId: 'Document ID',
  anchored: 'Anchored',
  recipientCount: 'Recipients',
  verdict: 'Verdict',
  // Identity attestation - a separate claim from `verdict` (who attested vs. content integrity).
  identity: 'Identity'
} as const

export const DOCUMENTS_SLOT_PREFIX = 'Slot'

export const VERDICT_FILTER_ALL = 'ALL' as const

export type VerdictFilterValue = DocumentVerdict | typeof VERDICT_FILTER_ALL

export const VERDICT_FILTER_LABEL = 'Verdict'

export const VERDICT_FILTER_OPTIONS: { name: string; value: VerdictFilterValue }[] = [
  { name: 'All verdicts', value: VERDICT_FILTER_ALL },
  { name: 'Verified', value: 'VERIFIED' },
  { name: 'Malformed manifest', value: 'MALFORMED_MANIFEST' },
  { name: 'IPFS unavailable', value: 'IPFS_UNAVAILABLE' },
  { name: 'Content hash mismatch', value: 'CONTENT_HASH_MISMATCH' },
  { name: 'Malformed envelope', value: 'MALFORMED_ENVELOPE' },
  { name: 'Pending', value: 'PENDING' }
]

export const DOCUMENTS_ROWS_PER_PAGE_OPTIONS = [10, 25, 50]

export const DOCUMENTS_EMPTY_MESSAGE = 'No documents available'

export const DOCUMENTS_NO_MATCHING_MESSAGE = 'No documents match the selected verdict filter'

export const DOCUMENTS_ERROR_MESSAGE = 'Documents could not be loaded. Please try again later.'

// Entry point to the permissionless key-card flow. A key card is org-independent (an org-less card is
// valid), so this action is rendered unconditionally — it must never depend on an organisation being
// selected, or on documents having loaded.
export const ISSUE_KEY_CARD_BUTTON_LABEL = 'Issue key card'

// "Filter for my documents": the holder presents a PUBLIC key, the browser hashes it to the same
// recipient_key_hash the publisher anchored on-chain, and the list is filtered by that hash.
// No private key is ever derived, requested or transmitted, and nothing is persisted - the hash
// lives in React state only, matching DecryptPanel's stance that key material never outlives the page.
export const MY_DOCUMENTS_FILTER_BUTTON_LABEL = 'Filter for my documents'
export const MY_DOCUMENTS_FILTER_CANCEL_LABEL = 'Cancel'
export const MY_DOCUMENTS_FILTER_CLEAR_LABEL = 'Clear filter'
export const MY_DOCUMENTS_SOURCE_SELECTOR_LABEL = 'Key source'
export const MY_DOCUMENTS_SOURCE_PASSKEY = 'Passkey'
export const MY_DOCUMENTS_SOURCE_RAW = 'Paste public key'
export const MY_DOCUMENTS_PASSKEY_DESCRIPTION =
  'Unlock with the passkey your key was issued from. Only your public key is derived — the private key never leaves your device and is not needed to filter.'
export const MY_DOCUMENTS_PASSKEY_UNLOCK_BUTTON_LABEL = 'Unlock with passkey'
export const MY_DOCUMENTS_RAW_KEY_LABEL = 'X25519 public key (64 hex characters)'
export const MY_DOCUMENTS_USE_KEY_BUTTON_LABEL = 'Apply'
export const MY_DOCUMENTS_ACTIVE_PREFIX = 'Showing documents addressed to'
export const MY_DOCUMENTS_INVALID_KEY_MESSAGE = 'An X25519 public key must be 64 hexadecimal characters.'
export const MY_DOCUMENTS_PASSKEY_UNSUPPORTED_MESSAGE =
  'This browser or device cannot use passkeys. Paste your public key instead.'
export const MY_DOCUMENTS_PASSKEY_FAILED_MESSAGE =
  'Could not read a key from that passkey. Paste your public key instead.'

// Shown when a recipient filter is active and matched nothing. It must say why a CORRECT key can
// still return nothing, or the honest answer reads as a bug.
export const DOCUMENTS_NO_RECIPIENT_MATCH_MESSAGE =
  'No published document is addressed to this key. Documents anchored before metadata version 1.1 carry no recipient hashes and can never match.'
