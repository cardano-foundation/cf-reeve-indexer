import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Link from '@mui/material/Link'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import type { DocumentView } from 'libs/api-connectors/backend-connector-reeve/api/documents/documentsApi.types'
import { LayoutPublic } from 'libs/layout-kit/layout-public/LayoutPublic.component.tsx'
import { useGetDocumentDetailModel } from 'libs/models/documents-model/GetDocumentDetail/GetDocumentDetail.service.ts'
import { Alert } from 'libs/ui-kit/components/Alert/Alert.component.tsx'
import { ChecksList } from 'modules/public-document-detail/components/ChecksList/ChecksList.component'
import { DecryptPanel } from 'modules/public-document-detail/components/DecryptPanel/DecryptPanel.component'
import { VerdictSummary } from 'modules/public-document-detail/components/VerdictSummary/VerdictSummary.component'
import {
  DOCUMENT_DETAIL_BACK_LABEL,
  DOCUMENT_DETAIL_CHOOSE_ANCHOR_PROMPT,
  DOCUMENT_DETAIL_ERROR_MESSAGE,
  DOCUMENT_DETAIL_NOT_FOUND_MESSAGE,
  DOCUMENT_DETAIL_PAGE_DESCRIPTION,
  DOCUMENT_DETAIL_PAGE_TITLE,
  DUPLICATE_ANCHORS_WARNING
} from 'modules/public-document-detail/constants/detail.consts.ts'
import { explorerTxUrl, ipfsCidUrl } from 'modules/public-document-detail/utils/links.ts'
import { VerdictChip } from 'modules/public-documents/components/VerdictChip/VerdictChip.component'
import { formatBlockTime, truncateHash } from 'modules/public-documents/utils/format.ts'
import { PATHS } from 'routes'

const FieldRow = ({ label, value }: { label: string; value: string | number | null }) => {
  const theme = useTheme()

  return (
    <Box alignItems="baseline" display="flex" gap={1}>
      <Typography color={theme.palette.text.secondary} sx={{ minWidth: 160 }} variant="caption">
        {label}
      </Typography>
      <Typography color={theme.palette.text.primary} sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }} variant="body2">
        {value ?? '—'}
      </Typography>
    </Box>
  )
}

const AnchorCard = ({
  anchor,
  isDuplicate,
  isSelected,
  onSelect
}: {
  anchor: DocumentView
  isDuplicate: boolean
  isSelected: boolean
  onSelect: () => void
}) => {
  const theme = useTheme()
  const explorerLink = explorerTxUrl(anchor.tx_hash)
  const ipfsLink = anchor.ipfs_cid ? ipfsCidUrl(anchor.ipfs_cid) : null

  return (
    <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, p: 2 }}>
      <Box alignItems="flex-start" display="flex" justifyContent="space-between">
        <Box>
          <Typography sx={{ fontFamily: 'monospace' }} variant="subtitle2">
            {truncateHash(anchor.tx_hash)}
          </Typography>
          <Typography color={theme.palette.text.secondary} variant="caption">
            Slot {anchor.slot ?? '—'} · {formatBlockTime(anchor.block_time)}
          </Typography>
        </Box>
        <VerdictChip verdict={anchor.verdict} />
      </Box>

      <Box sx={{ mt: 1.5 }}>
        <VerdictSummary verdict={anchor.verdict} />
      </Box>

      <Box display="flex" flexDirection="column" gap={0.5} sx={{ my: 1.5 }}>
        <FieldRow label="Content hash" value={anchor.content_hash} />
        <FieldRow label="Plaintext hash (on-chain)" value={anchor.plaintext_hash} />
        <FieldRow label="IPFS CID" value={anchor.ipfs_cid} />
        <FieldRow label="Envelope version" value={anchor.envelope_version} />
        <FieldRow label="Slot count" value={anchor.slot_count} />
      </Box>

      <Box display="flex" gap={2} sx={{ mb: 1.5 }}>
        {explorerLink && (
          <Link href={explorerLink} rel="noreferrer" target="_blank" variant="body2">
            View transaction on explorer
          </Link>
        )}
        {ipfsLink && (
          <Link href={ipfsLink} rel="noreferrer" target="_blank" variant="body2">
            View raw envelope on IPFS
          </Link>
        )}
      </Box>

      <ChecksList checks={anchor.checks} verdict={anchor.verdict} />

      {isDuplicate && (
        <Box sx={{ mt: 2 }}>
          <Button disabled={isSelected} variant={isSelected ? 'contained' : 'outlined'} onClick={onSelect}>
            {isSelected ? 'Selected for decrypt' : 'Decrypt this anchor'}
          </Button>
        </Box>
      )}
    </Box>
  )
}

/**
 * The document detail + in-browser decrypt panel (contract §9.6/§2.6). No login anywhere on this
 * path - it is the page an external auditor lands on to independently verify and, if they hold a
 * key, decrypt a published document.
 */
export const ViewPublicDocumentDetail = () => {
  const { organisationId, documentId } = useParams<{ organisationId: string; documentId: string }>()
  const { detail, isFetching, isError } = useGetDocumentDetailModel(documentId)

  // Deterministic destination: this page is reachable by deep link/refresh, where there is no in-app
  // history to go back to, so the back action always targets the list it belongs to.
  const documentsListPath = organisationId ? `/documents/${organisationId}` : PATHS.PUBLIC_DOCUMENTS

  const [selectedTxHash, setSelectedTxHash] = useState<string | null>(null)

  useEffect(() => {
    if (detail && !detail.duplicate_anchors && detail.anchors.length === 1) {
      setSelectedTxHash(detail.anchors[0].tx_hash)
    } else {
      setSelectedTxHash(null)
    }
  }, [detail])

  const anchors = detail?.anchors ?? []
  const selectedAnchor = anchors.find((anchor) => anchor.tx_hash === selectedTxHash) ?? null

  return (
    <>
      <LayoutPublic.Header>
        <Box alignItems="center" display="flex" gap={1}>
          <LayoutPublic.Header.ButtonBack aria-label={DOCUMENT_DETAIL_BACK_LABEL} to={documentsListPath} />
          <LayoutPublic.Header.Details description={DOCUMENT_DETAIL_PAGE_DESCRIPTION} title={DOCUMENT_DETAIL_PAGE_TITLE} />
        </Box>
      </LayoutPublic.Header>
      <LayoutPublic.Main flexDirection="column" gap={3} isHeightRestricted>
        <Box sx={{ height: 3 }}>{isFetching && <LinearProgress />}</Box>

        {isError && <Alert severity="error">{DOCUMENT_DETAIL_ERROR_MESSAGE}</Alert>}

        {!isFetching && !isError && detail && anchors.length === 0 && <Alert severity="warning">{DOCUMENT_DETAIL_NOT_FOUND_MESSAGE}</Alert>}

        {detail && detail.duplicate_anchors && <Alert severity="warning">{DUPLICATE_ANCHORS_WARNING}</Alert>}

        {anchors.map((anchor) => (
          <AnchorCard
            key={anchor.tx_hash}
            anchor={anchor}
            isDuplicate={detail?.duplicate_anchors ?? false}
            isSelected={selectedAnchor?.tx_hash === anchor.tx_hash}
            onSelect={() => setSelectedTxHash(anchor.tx_hash)}
          />
        ))}

        {detail && anchors.length > 0 && (
          <Box sx={{ border: (theme) => `1px solid ${theme.palette.divider}`, borderRadius: 2, p: 2 }}>
            {selectedAnchor ? (
              <DecryptPanel anchor={selectedAnchor} documentId={detail.document_id} />
            ) : (
              <Alert severity="info">{DOCUMENT_DETAIL_CHOOSE_ANCHOR_PROMPT}</Alert>
            )}
          </Box>
        )}
      </LayoutPublic.Main>
    </>
  )
}
