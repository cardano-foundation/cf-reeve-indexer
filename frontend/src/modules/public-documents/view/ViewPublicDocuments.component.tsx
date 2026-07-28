import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import LinearProgress from '@mui/material/LinearProgress'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { useTheme } from '@mui/material/styles'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { DocumentView } from 'libs/api-connectors/backend-connector-reeve/api/documents/documentsApi.types'
import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext.ts'
import { LayoutPublic } from 'libs/layout-kit/layout-public/LayoutPublic.component.tsx'
import { Alert } from 'libs/ui-kit/components/Alert/Alert.component.tsx'
import { IdentityAttestationBadge } from 'libs/ui-kit/components/IdentityAttestationBadge/IdentityAttestationBadge.component.tsx'
import { HonestLimits } from 'modules/public-documents/components/HonestLimits/HonestLimits.component'
import { MyDocumentsFilter } from 'modules/public-documents/components/MyDocumentsFilter/MyDocumentsFilter.component'
import { VerdictChip } from 'modules/public-documents/components/VerdictChip/VerdictChip.component'
import {
  DOCUMENTS_EMPTY_MESSAGE,
  DOCUMENTS_ERROR_MESSAGE,
  DOCUMENTS_NO_MATCHING_MESSAGE,
  DOCUMENTS_NO_RECIPIENT_MATCH_MESSAGE,
  DOCUMENTS_PAGE_DESCRIPTION,
  DOCUMENTS_PAGE_TITLE,
  DOCUMENTS_ROWS_PER_PAGE_OPTIONS,
  DOCUMENTS_SLOT_PREFIX,
  DOCUMENTS_TABLE_COLUMNS,
  ISSUE_KEY_CARD_BUTTON_LABEL,
  MALFORMED_ANCHOR_LABEL,
  VERDICT_FILTER_ALL,
  VERDICT_FILTER_LABEL,
  VERDICT_FILTER_OPTIONS,
  VerdictFilterValue
} from 'modules/public-documents/constants/documents.consts.ts'
import { usePublicDocuments } from 'modules/public-documents/hooks/usePublicDocuments.ts'
import { formatBlockTime, truncateHash } from 'modules/public-documents/utils/format.ts'
import { PATHS } from 'routes'

const DocumentIdCell = ({ row }: { row: DocumentView }) => {
  const theme = useTheme()

  if (!row.document_id) {
    return (
      <Typography color={theme.palette.text.secondary} sx={{ fontFamily: 'monospace' }} variant="body2">
        {`${MALFORMED_ANCHOR_LABEL}: ${truncateHash(row.tx_hash)}`}
      </Typography>
    )
  }

  return (
    <Typography color={theme.palette.text.primary} sx={{ fontFamily: 'monospace' }} variant="body2">
      {truncateHash(row.document_id)}
    </Typography>
  )
}

/**
 * Identity-attestation badge(s) for a document row - a separate claim from the content
 * `VerdictChip`/`VerdictSummary` (who attested this document vs. whether its bytes are intact).
 * Only rendered when the row actually carries identities.
 */
const IdentityCell = ({ row }: { row: DocumentView }) => {
  const theme = useTheme()
  const identities = row.identities ?? []

  if (identities.length === 0) {
    return (
      <Typography color={theme.palette.text.secondary} variant="body2">
        —
      </Typography>
    )
  }

  return (
    <Box alignItems="center" display="flex" flexWrap="nowrap" gap={0.5}>
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
  )
}

export const ViewPublicDocuments = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { organisationId: orgIdFromPath } = useParams<{ organisationId: string }>()
  const [searchParams] = useSearchParams()
  const { organisations, selectedOrganisation, setSelectedOrganisation } = useLayoutPublicContext()

  const {
    documents,
    isFetching,
    isError,
    page,
    rowsPerPage,
    onPaginationChange,
    verdict,
    onVerdictChange,
    recipientKeyHash,
    onRecipientKeyHashChange
  } = usePublicDocuments()

  useEffect(() => {
    const orgId = orgIdFromPath || searchParams.get('organisation_id')
    if (orgId && organisations?.length > 0) {
      const organisationExists = organisations.some((o: { id: string }) => o.id === orgId)
      if (organisationExists) {
        setSelectedOrganisation(orgId)
      }
    }
  }, [orgIdFromPath, searchParams, organisations, setSelectedOrganisation])

  const effectiveOrganisation = selectedOrganisation || orgIdFromPath || ''

  const rows = documents?.content ?? []
  const total = documents?.total ?? 0

  const navigateToDetail = (row: DocumentView) => {
    if (!row.document_id) return

    navigate(`/documents/${effectiveOrganisation}/detail/${row.document_id}`)
  }

  const handleVerdictChange = (event: SelectChangeEvent<VerdictFilterValue>) => {
    onVerdictChange(event.target.value as VerdictFilterValue)
  }

  return (
    <>
      <LayoutPublic.Header>
        <LayoutPublic.Header.Details description={DOCUMENTS_PAGE_DESCRIPTION} title={DOCUMENTS_PAGE_TITLE} />
      </LayoutPublic.Header>
      <LayoutPublic.Main flexDirection="column" gap={4} isHeightRestricted>
        <HonestLimits />

        {isError && <Alert severity="error">{DOCUMENTS_ERROR_MESSAGE}</Alert>}

        <Box
          alignItems={{ xs: 'stretch', sm: 'center' }}
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          gap={2}
          justifyContent="space-between">
          <Box sx={{ width: { xs: '100%', sm: '16rem' } }}>
            <FormControl fullWidth size="small">
              <InputLabel id="documents-verdict-filter-label">{VERDICT_FILTER_LABEL}</InputLabel>
              <Select<VerdictFilterValue>
                label={VERDICT_FILTER_LABEL}
                labelId="documents-verdict-filter-label"
                value={verdict}
                onChange={handleVerdictChange}>
                {VERDICT_FILTER_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <MyDocumentsFilter onRecipientKeyHashChange={onRecipientKeyHashChange} recipientKeyHash={recipientKeyHash} />

          {/* Rendered unconditionally: a key card is org-independent, so this must not depend on a
              selected organisation or on the documents list having loaded. */}
          <Button variant="contained" onClick={() => navigate(PATHS.CARD_ISSUANCE)}>
            {ISSUE_KEY_CARD_BUTTON_LABEL}
          </Button>
        </Box>

        <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ height: 3 }}>{isFetching && <LinearProgress />}</Box>
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow>
                  <TableCell>{DOCUMENTS_TABLE_COLUMNS.documentId}</TableCell>
                  <TableCell>{DOCUMENTS_TABLE_COLUMNS.anchored}</TableCell>
                  <TableCell align="right">{DOCUMENTS_TABLE_COLUMNS.recipientCount}</TableCell>
                  <TableCell>{DOCUMENTS_TABLE_COLUMNS.verdict}</TableCell>
                  <TableCell>{DOCUMENTS_TABLE_COLUMNS.identity}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography color={theme.palette.text.secondary} sx={{ py: 2 }} textAlign="center" variant="body2">
                        {isFetching
                          ? ''
                          : recipientKeyHash
                            ? DOCUMENTS_NO_RECIPIENT_MATCH_MESSAGE
                            : verdict !== VERDICT_FILTER_ALL
                              ? DOCUMENTS_NO_MATCHING_MESSAGE
                              : DOCUMENTS_EMPTY_MESSAGE}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => {
                    const isClickable = Boolean(row.document_id)

                    return (
                      <TableRow
                        key={row.tx_hash}
                        hover={isClickable}
                        sx={{ cursor: isClickable ? 'pointer' : 'default' }}
                        onClick={() => navigateToDetail(row)}>
                        <TableCell>
                          <DocumentIdCell row={row} />
                        </TableCell>
                        <TableCell>
                          <Typography color={theme.palette.text.primary} variant="body2">
                            {formatBlockTime(row.block_time)}
                          </Typography>
                          <Typography color={theme.palette.text.secondary} variant="caption">
                            {DOCUMENTS_SLOT_PREFIX} {row.slot ?? '—'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography color={theme.palette.text.primary} variant="body2">
                            {row.recipient_count ?? '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <VerdictChip verdict={row.verdict} />
                        </TableCell>
                        <TableCell>
                          <IdentityCell row={row} />
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </Box>
          <TablePagination
            component="div"
            count={total}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={DOCUMENTS_ROWS_PER_PAGE_OPTIONS}
            onPageChange={(_, newPage) => onPaginationChange(newPage, rowsPerPage)}
            onRowsPerPageChange={(event) => onPaginationChange(0, parseInt(event.target.value, 10))}
          />
        </Box>
      </LayoutPublic.Main>
    </>
  )
}

