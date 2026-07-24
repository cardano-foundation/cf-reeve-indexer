import type { IdentityAttestationView } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types.ts'

// Re-exported so consumers of the documents API don't need to know the generic identity DTO's
// definition lives alongside the reports API - it is shared by both (design spec §D).
export type { IdentityAttestationView }

export type CheckStatus = 'PASS' | 'FAIL' | 'PENDING'

export type DocumentVerdict =
  | 'VERIFIED'
  | 'MALFORMED_MANIFEST'
  | 'IPFS_UNAVAILABLE'
  | 'CONTENT_HASH_MISMATCH'
  | 'MALFORMED_ENVELOPE'
  | 'PENDING'

export type DocumentChecks = {
  manifest: CheckStatus
  ipfs: CheckStatus
  content_hash: CheckStatus
  envelope: CheckStatus
}

export type DocumentView = {
  tx_hash: string
  document_id: string | null
  organisation_id: string | null
  ipfs_cid: string | null
  content_hash: string | null
  plaintext_hash: string | null
  envelope_version: number | null
  slot_count: number | null
  slot: number | null
  block_time: number | null
  checks: DocumentChecks
  verdict: DocumentVerdict
  created_at: string
  // Identity attestation(s) verified against this anchor's on-chain KERI label-170 metadata - a
  // separate claim from `verdict` (IPFS content integrity). A document has at most one, but this
  // mirrors the reports API's shape (design spec §D).
  identities?: IdentityAttestationView[]
}

export type DocumentListResponse = {
  content: DocumentView[]
  total: number
  total_pages: number
  page: number
  size: number
}

export type DocumentDetailResponse = {
  document_id: string
  anchors: DocumentView[]
  duplicate_anchors: boolean
}

export type GetDocumentsParams = {
  orgId?: string
  verdict?: DocumentVerdict
  page?: number
  size?: number
  sort?: string
}
