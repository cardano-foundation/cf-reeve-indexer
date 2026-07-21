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
