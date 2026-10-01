import { Chip } from '@mui/material'

import type { DocumentVerdict } from 'libs/api-connectors/backend-connector-reeve/api/documents/documentsApi.types'

type VerdictChipProps = { verdict: DocumentVerdict }

const VERDICT_COLOR: Record<DocumentVerdict, 'success' | 'warning' | 'error' | 'default'> = {
  VERIFIED: 'success',
  MALFORMED_MANIFEST: 'error',
  IPFS_UNAVAILABLE: 'warning',
  CONTENT_HASH_MISMATCH: 'error',
  MALFORMED_ENVELOPE: 'error',
  PENDING: 'default'
}

export const VerdictChip = ({ verdict }: VerdictChipProps) => (
  <Chip color={VERDICT_COLOR[verdict]} label={verdict} size="small" variant={verdict === 'VERIFIED' ? 'filled' : 'outlined'} />
)
