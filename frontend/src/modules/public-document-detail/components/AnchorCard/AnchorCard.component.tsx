import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { ArrowDown2, Copy, Box as IconBox, Link1 } from 'iconsax-react'
import { useState } from 'react'

import type { DocumentView } from 'libs/api-connectors/backend-connector-reeve/api/documents/documentsApi.types'
import { IdentityAttestationBadge } from 'libs/ui-kit/components/IdentityAttestationBadge/IdentityAttestationBadge.component.tsx'
import { ChecksList } from 'modules/public-document-detail/components/ChecksList/ChecksList.component'
import { VerdictSummary } from 'modules/public-document-detail/components/VerdictSummary/VerdictSummary.component'
import {
  ANCHOR_ANCHORED_LABEL,
  ANCHOR_DETAILS_SUMMARY,
  ANCHOR_EXPLORER_LINK_LABEL,
  ANCHOR_FIELD_LABELS,
  ANCHOR_IPFS_LINK_LABEL,
  ANCHOR_SELECT_LABEL,
  ANCHOR_SELECTED_LABEL,
  ANCHOR_SLOT_LABEL,
  COPY_DONE_LABEL,
  COPY_LABEL,
  IDENTITY_ATTESTATION_LABEL
} from 'modules/public-document-detail/constants/detail.consts.ts'
import { explorerTxUrl, ipfsCidUrl } from 'modules/public-document-detail/utils/links.ts'
import { VerdictChip } from 'libs/documents-kit/components/VerdictChip/VerdictChip.component'
import { formatBlockTime } from 'libs/documents-kit/utils/format.ts'

type AnchorCardProps = {
  anchor: DocumentView
  isDuplicate: boolean
  isSelected: boolean
  onSelect: () => void
}

const COPY_RESET_DELAY_MS = 1500

/**
 * One label/value pair of raw anchor data, shown in full rather than truncated — these are values a
 * reader compares against another system, so an elided middle would defeat the purpose. Hashes get a
 * copy button for the same reason: nobody transcribes 64 hex characters by hand.
 */
const DetailField = ({ label, value }: { label: string; value: string | number | null }) => {
  const theme = useTheme()
  const [hasCopied, setHasCopied] = useState(false)
  const isCopyable = typeof value === 'string' && value.length > 0

  const handleCopy = async () => {
    if (!isCopyable) return
    await navigator.clipboard.writeText(value)
    setHasCopied(true)
    setTimeout(() => setHasCopied(false), COPY_RESET_DELAY_MS)
  }

  return (
    <Box display="flex" flexDirection="column" gap={0.25}>
      <Typography color={theme.palette.text.secondary} variant="caption">
        {label}
      </Typography>
      <Box alignItems="center" display="flex" gap={0.5}>
        <Typography sx={{ fontFamily: 'monospace', fontSize: '0.8125rem', wordBreak: 'break-all' }}>{value ?? '—'}</Typography>
        {isCopyable && (
          <Tooltip title={hasCopied ? COPY_DONE_LABEL : COPY_LABEL}>
            <IconButton aria-label={COPY_LABEL} size="small" onClick={() => void handleCopy()}>
              <Copy size={14} variant="Outline" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  )
}

/**
 * A single on-chain anchor of a document.
 *
 * The card answers three questions on sight — is it verified, who attested it, and when was it
 * anchored — and keeps everything else one click away. The hashes and per-check results are the
 * evidence behind the verdict rather than the verdict itself, and showing all of them at once
 * turned the page into a wall of monospace that buried the answer a reader came for.
 */
export const AnchorCard = ({ anchor, isDuplicate, isSelected, onSelect }: AnchorCardProps) => {
  const theme = useTheme()
  const explorerLink = explorerTxUrl(anchor.tx_hash)
  const ipfsLink = anchor.ipfs_cid ? ipfsCidUrl(anchor.ipfs_cid) : null
  const identities = anchor.identities ?? []

  return (
    <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Stack alignItems="flex-start" direction="row" gap={2} justifyContent="space-between">
          <Box sx={{ minWidth: 0 }}>
            <VerdictChip verdict={anchor.verdict} />
            <Box sx={{ mt: 1 }}>
              <VerdictSummary verdict={anchor.verdict} />
            </Box>
          </Box>

          <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
            <Typography color={theme.palette.text.secondary} variant="caption">
              {ANCHOR_ANCHORED_LABEL}
            </Typography>
            <Typography variant="body2">{formatBlockTime(anchor.block_time)}</Typography>
            <Typography color={theme.palette.text.secondary} variant="caption">
              {ANCHOR_SLOT_LABEL} {anchor.slot ?? '—'}
            </Typography>
          </Box>
        </Stack>

        {identities.length > 0 && (
          <Box>
            <Typography color={theme.palette.text.secondary} variant="caption">
              {IDENTITY_ATTESTATION_LABEL}
            </Typography>
            <Box alignItems="center" display="flex" flexWrap="wrap" gap={1} sx={{ mt: 0.5 }}>
              {identities.map((identity, index) => (
                <IdentityAttestationBadge
                  key={index}
                  isVerified={identity.identityVerified}
                  schemaName={identity.schemaName}
                  schemaSaid={identity.schemaSaid}
                  claims={identity.claims}
                  lei={identity.lei}
                  txHash={identity.txHash}
                  credentialTxHash={identity.credentialTxHash}
                />
              ))}
            </Box>
          </Box>
        )}

        <Stack alignItems="center" direction="row" gap={2} flexWrap="wrap">
          {explorerLink && (
            <Link
              alignItems="center"
              display="inline-flex"
              gap={0.5}
              href={explorerLink}
              rel="noreferrer"
              target="_blank"
              variant="body2">
              <Link1 size={14} color="currentColor" />
              {ANCHOR_EXPLORER_LINK_LABEL}
            </Link>
          )}
          {ipfsLink && (
            <Link
              alignItems="center"
              display="inline-flex"
              gap={0.5}
              href={ipfsLink}
              rel="noreferrer"
              target="_blank"
              variant="body2">
              <IconBox size={14} color="currentColor" />
              {ANCHOR_IPFS_LINK_LABEL}
            </Link>
          )}

          {isDuplicate && (
            <Box sx={{ ml: 'auto' }}>
              <Button disabled={isSelected} size="small" variant={isSelected ? 'contained' : 'outlined'} onClick={onSelect}>
                {isSelected ? ANCHOR_SELECTED_LABEL : ANCHOR_SELECT_LABEL}
              </Button>
            </Box>
          )}
        </Stack>
      </Box>

      <Accordion
        disableGutters
        elevation={0}
        square
        sx={{
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: 'transparent',
          '&::before': { display: 'none' }
        }}>
        <AccordionSummary expandIcon={<ArrowDown2 size={16} color={theme.palette.text.secondary} />} sx={{ px: 2.5 }}>
          <Typography color={theme.palette.text.secondary} variant="body2">
            {ANCHOR_DETAILS_SUMMARY}
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 2.5, pt: 0, pb: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <ChecksList checks={anchor.checks} verdict={anchor.verdict} />

          <Divider />

          <Box display="flex" flexDirection="column" gap={1.5}>
            <DetailField label={ANCHOR_FIELD_LABELS.txHash} value={anchor.tx_hash} />
            <DetailField label={ANCHOR_FIELD_LABELS.contentHash} value={anchor.content_hash} />
            <DetailField label={ANCHOR_FIELD_LABELS.plaintextHash} value={anchor.plaintext_hash} />
            <DetailField label={ANCHOR_FIELD_LABELS.ipfsCid} value={anchor.ipfs_cid} />
            <Stack direction="row" gap={4}>
              <DetailField label={ANCHOR_FIELD_LABELS.envelopeVersion} value={anchor.envelope_version} />
              <DetailField label={ANCHOR_FIELD_LABELS.recipientCount} value={anchor.recipient_count} />
            </Stack>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}
