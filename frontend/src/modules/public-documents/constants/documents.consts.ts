import type { DocumentVerdict } from 'libs/api-connectors/backend-connector-reeve/api/documents/documentsApi.types'

/**
 * Copy and constants for the public, org-scoped documents list. The two non-negotiable UI rules
 * this module must uphold:
 *  1. The list is hash-identified — there is no file-name column, because the data cannot contain one (I10).
 *  2. The HONEST_LIMIT_VERIFIED_MEANING sentence is stated verbatim on the page via the HonestLimits component.
 */

export const DOCUMENTS_PAGE_TITLE = 'Documents'

export const DOCUMENTS_PAGE_DESCRIPTION = 'Hash-identified, independently verified anchors of encrypted documents published on-chain by this organisation.'

// Rule 2 — the honest-limit sentence, verbatim.
export const HONEST_LIMIT_VERIFIED_MEANING =
  'VERIFIED means: the bytes on IPFS are exactly the bytes this organisation anchored on Cardano. It does NOT check the encrypted content against a real file — only a key holder can do that, by decrypting.'

// Rule 1 — placeholder id shown for anchors that failed before a document_id could be assigned.
// This is NOT a file name; it is derived from the anchor transaction hash.
export const MALFORMED_ANCHOR_LABEL = 'Malformed anchor'

export const DOCUMENTS_TABLE_COLUMNS = {
  documentId: 'Document ID',
  slot: 'Slot',
  blockTime: 'Block time',
  contentHash: 'Content hash',
  slotCount: 'Slots',
  verdict: 'Verdict',
  // Identity attestation - a separate claim from `verdict` (who attested vs. content integrity).
  identity: 'Identity'
} as const

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
