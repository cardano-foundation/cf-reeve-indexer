import type { CheckStatus, DocumentChecks, DocumentVerdict } from 'libs/api-connectors/backend-connector-reeve/api/documents/documentsApi.types'

/**
 * Copy and constants for the document detail + in-browser decrypt panel (§2.6/§9.5).
 * Non-negotiable rules this module must uphold:
 *  1. The four checks render in verification order with a one-line explanation each.
 *  2. VERIFIED_CLAIM_SENTENCE is the integrity claim, shown verbatim only when verdict === 'VERIFIED'.
 *  3. duplicate_anchors === true always shows DUPLICATE_ANCHORS_WARNING - a forgery signal, never hidden.
 *  4. The three decrypt outcome banners (no-slot / match / mismatch) are shown verbatim (I7 aside,
 *     which surfaces the thrown error message itself rather than a generic string).
 */

export type CheckKey = keyof DocumentChecks

// Verification order - the check sequence. Never reorder.
export const CHECKS_ORDER: CheckKey[] = ['manifest', 'ipfs', 'content_hash', 'envelope']

export const CHECK_COPY: Record<CheckKey, { label: string; explanation: string }> = {
  manifest: {
    label: 'Anchor exists / manifest parses',
    explanation: 'The anchoring transaction is on-chain and its manifest (id, IPFS CID, hashes, envelope version) parses cleanly.'
  },
  ipfs: {
    label: 'IPFS resolves',
    explanation: 'The envelope document fetches successfully from IPFS at the anchored CID.'
  },
  content_hash: {
    label: 'Chain ↔ IPFS integrity',
    explanation: 'SHA-256 of the fetched ciphertext matches the content_hash anchored on-chain — the IPFS bytes are the anchored bytes.'
  },
  envelope: {
    label: 'Envelope well-formed',
    explanation: 'The envelope parses at the declared version/type with well-formed fields, ready for decryption.'
  }
}

export const CHECK_STATUS_LABEL: Record<CheckStatus, string> = {
  PASS: 'Pass',
  FAIL: 'Fail',
  PENDING: 'Pending'
}

export type VerdictSeverity = 'success' | 'warning' | 'error' | 'info'

export type VerdictSummaryEntry = { severity: VerdictSeverity; headline: string; sentence: string }

// The at-a-glance verdict banner for the detail view: each verdict in one plain-language line, so a
// reader sees the outcome before reading the four individual checks below it.
export const VERDICT_SUMMARY: Record<DocumentVerdict, VerdictSummaryEntry> = {
  VERIFIED: {
    severity: 'success',
    headline: 'Verified',
    sentence: 'The bytes on IPFS are exactly what this organisation anchored on Cardano, and nobody has swapped them since.'
  },
  PENDING: {
    severity: 'info',
    headline: 'Verification pending',
    sentence: 'This anchor is still being checked against IPFS. Come back shortly for a final verdict.'
  },
  IPFS_UNAVAILABLE: {
    severity: 'warning',
    headline: 'Envelope unavailable on IPFS',
    sentence: 'The anchored bytes could not be fetched from IPFS, so their integrity could not be confirmed yet.'
  },
  MALFORMED_MANIFEST: {
    severity: 'error',
    headline: 'Malformed manifest',
    sentence: "The anchoring transaction's manifest could not be parsed, so this anchor cannot be verified."
  },
  CONTENT_HASH_MISMATCH: {
    severity: 'error',
    headline: 'Content hash mismatch',
    sentence: 'The bytes on IPFS do NOT match what was anchored on-chain — they may have been substituted.'
  },
  MALFORMED_ENVELOPE: {
    severity: 'error',
    headline: 'Malformed envelope',
    sentence: 'The fetched envelope is not a well-formed encrypted document at its declared version.'
  }
}

// Contract §9.3 - the claim a VERIFIED verdict is allowed to make. Verbatim, only under VERIFIED.
export const VERIFIED_CLAIM_SENTENCE =
  'The bytes on IPFS are exactly the bytes this organisation anchored on Cardano, at this slot, and nobody has swapped them since.'

// duplicate_anchors === true - multiple on-chain anchors claim the same document id.
export const DUPLICATE_ANCHORS_WARNING =
  'Multiple on-chain anchors claim this document id. This is a substitution/forgery signal — review each anchor independently before trusting any of them.'

// Label for the identity-attestation section - kept visually distinct from the VerdictSummary
// above it, since the two are separate claims: who attested this document vs. whether its bytes
// are intact.
export const IDENTITY_ATTESTATION_LABEL = 'Identity attestation'

export const DOCUMENT_DETAIL_PAGE_TITLE = 'Document detail'

// Accessible name for the back affordance. The detail page is reachable by deep link, so the back
// action targets the documents list explicitly rather than depending on browser history.
export const DOCUMENT_DETAIL_BACK_LABEL = 'Back to documents'

export const DOCUMENT_DETAIL_PAGE_DESCRIPTION =
  'Independent verification of a single hash-identified document, with an in-browser decrypt panel for key holders.'

export const DOCUMENT_DETAIL_ERROR_MESSAGE = 'This document could not be loaded. Please try again later.'

export const DOCUMENT_DETAIL_NOT_FOUND_MESSAGE = 'No anchors were found for this document id.'

export const DOCUMENT_DETAIL_CHOOSE_ANCHOR_PROMPT = 'Choose which anchor to verify and decrypt.'

// §2.6 decrypt panel copy.
export const DECRYPT_PANEL_TITLE = 'Decrypt this document'

export const DECRYPT_PANEL_DESCRIPTION =
  'Everything below runs in your browser. Your private key is never sent to Reeve, logged, or stored — the only network calls this page makes are the two public GET requests that load the anchor details and the encrypted envelope.'

// Key-source selector — the two ways to supply a decryption key, most-secure first.
export const DECRYPT_SOURCE_PASSKEY = 'Passkey'

export const DECRYPT_SOURCE_RAW = 'Raw key'

export const DECRYPT_SOURCE_SELECTOR_LABEL = 'How do you want to unlock your key?'

export const DECRYPT_PASSKEY_UNLOCK_BUTTON_LABEL = 'Unlock with passkey'

export const DECRYPT_PASSKEY_DESCRIPTION =
  'Select the passkey your key card was created with. Your private key is re-derived on your device from the passkey — it is never uploaded, and no keychain file is needed.'

export const DECRYPT_RAW_KEY_LABEL = 'Or paste a raw private key (64 hex characters)'

export const DECRYPT_RAW_KEY_INVALID = 'Enter a 64-character hexadecimal private key.'

export const DECRYPT_USE_KEY_BUTTON_LABEL = 'Use this key'

export const DECRYPT_BUTTON_LABEL = 'Decrypt'

export const DECRYPT_DECRYPTING_LABEL = 'Decrypting…'

export const DECRYPT_DOWNLOAD_BUTTON_LABEL = 'Download decrypted file'

export const DECRYPT_RESET_BUTTON_LABEL = 'Start over'

// In-browser viewer copy. The preview renders the DECRYPTED bytes locally; nothing is uploaded.
export const DECRYPT_VIEWER_TITLE = 'Preview'

export const DECRYPT_VIEWER_PDF_SHOW = 'Show PDF preview'

export const DECRYPT_VIEWER_PDF_HIDE = 'Hide PDF preview'

export const DECRYPT_VIEWER_IMAGE_ALT = 'Decrypted document preview'

export const DECRYPT_VIEWER_BINARY_MESSAGE =
  'This looks like binary data with no safe inline preview. Download it to open in the right application.'

// Shown instead of a preview when the decrypted bytes do not match the on-chain plaintext hash:
// unverified content is never rendered inline (a hostile PDF/SVG must not reach the browser here).
export const DECRYPT_VIEWER_UNVERIFIED_MESSAGE =
  'Preview is disabled because the decrypted content does not match the on-chain hash. You can still download it to inspect it yourself.'

export const DECRYPT_NO_ANCHOR_HASH_MESSAGE = 'This anchor has no on-chain plaintext hash to verify against.'

// The §2.6 outcome banners - verbatim.
export const DECRYPT_NO_KEY_OPENS_MESSAGE = 'None of your keys can open this document.'

export const DECRYPT_MATCH_MESSAGE = 'Decrypted content matches the on-chain plaintext hash — this ciphertext IS this file.'

export const DECRYPT_MISMATCH_MESSAGE = 'Decrypted content does NOT match the on-chain plaintext hash.'

// The downloaded file name is generic by design (I10): the real name is PII and never left Reeve.
export const buildDownloadFilename = (documentId: string) => `document-${documentId}.bin`
