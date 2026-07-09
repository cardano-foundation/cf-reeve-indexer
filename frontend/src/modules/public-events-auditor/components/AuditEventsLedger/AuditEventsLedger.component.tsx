import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import LinearProgress from '@mui/material/LinearProgress'
import Link from '@mui/material/Link'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { ExportSquare, Eye, SearchNormal1 } from 'iconsax-react'
import { MouseEvent, ReactNode, useState } from 'react'

import { Modal, useModal } from 'features/common'
import { IconButton } from 'features/mui/base'
import { EventView } from 'libs/api-connectors/backend-connector-reeve/api/events/publicEventsApi.types'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { Chip } from 'libs/ui-kit/components/Chip/Chip.component.tsx'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { EventDetail } from 'modules/public-events/components/EventDetail/EventDetail.component'
import { useAuditEventsLedger } from 'modules/public-events-auditor/hooks/useAuditEventsLedger.ts'
import { eventTypeColor, eventTypeLabelId } from 'modules/public-events-auditor/utils/eventType.ts'
import { EXPLORER_TX_URL } from 'modules/public-events-auditor/utils/explorer.ts'
import { formatAuditAmount, formatAuditDate } from 'modules/public-events-auditor/utils/format.ts'

interface AuditEventsLedgerProps {
  organisationId: string
  dateFrom?: string
  dateTo?: string
  projectIds?: string[]
}

const FILTER_TYPES = ['FUNDING', 'SPENDING', 'REFUND']

const truncateHash = (hash: string) => (hash.length > 14 ? `${hash.slice(0, 8)}…${hash.slice(-6)}` : hash)

export const AuditEventsLedger = ({ organisationId, dateFrom, dateTo, projectIds }: AuditEventsLedgerProps) => {
  const { t } = useTranslations()
  const theme = useTheme()

  const {
    events,
    total,
    isFetching,
    page,
    rowsPerPage,
    onPaginationChange,
    sortBy,
    sortOrder,
    onSortChange,
    selectedTypes,
    toggleType,
    search,
    setSearch,
    hasFilters
  } = useAuditEventsLedger(organisationId, dateFrom, dateTo, projectIds)

  const { isOpen, handleModalOpen, handleModalClose } = useModal()
  const [selectedEvent, setSelectedEvent] = useState<EventView | null>(null)

  const openDetail = (event: EventView) => {
    setSelectedEvent(event)
    handleModalOpen()
  }

  const handleSort = (field: string) => {
    const nextOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc'
    onSortChange(field, nextOrder)
  }

  const SortHeader = ({ field, children, align }: { field: string; children: ReactNode; align?: 'right' }) => (
    <TableCell align={align} sortDirection={sortBy === field ? sortOrder ?? false : false}>
      <TableSortLabel active={sortBy === field} direction={sortBy === field && sortOrder === 'desc' ? 'desc' : 'asc'} onClick={() => handleSort(field)}>
        {children}
      </TableSortLabel>
    </TableCell>
  )

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Box alignItems="center" display="flex" flexWrap="wrap" gap={1.5} justifyContent="space-between">
        <Box alignItems="center" display="flex" flexWrap="wrap" gap={1}>
          {FILTER_TYPES.map((type) => {
            const active = selectedTypes.includes(type)
            const accent = eventTypeColor(type)
            return (
              <Chip
                key={type}
                clickable
                label={t({ id: eventTypeLabelId(type) })}
                onClick={() => toggleType(type)}
                sx={{
                  borderColor: accent,
                  color: active ? theme.palette.common.white : accent,
                  backgroundColor: active ? accent : `${accent}14`,
                  fontWeight: 600
                }}
              />
            )
          })}
        </Box>
        <TextField
          size="small"
          placeholder={t({ id: 'auditSearchPlaceholder' })}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          sx={{ minWidth: { xs: '100%', sm: '18rem' } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchNormal1 color={theme.palette.action.active} size={18} />
              </InputAdornment>
            )
          }}
        />
      </Box>

      <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ height: 3 }}>{isFetching && <LinearProgress />}</Box>
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                <SortHeader field="date">{t({ id: 'eventDate' })}</SortHeader>
                <SortHeader field="eventType">{t({ id: 'eventType' })}</SortHeader>
                <SortHeader field="fundingId">{t({ id: 'auditReference' })}</SortHeader>
                <TableCell>{t({ id: 'auditProjectMilestone' })}</TableCell>
                <SortHeader align="right" field="totalAmount">
                  {t({ id: 'auditAmount' })}
                </SortHeader>
                <SortHeader field="txHash">{t({ id: 'auditTransaction' })}</SortHeader>
                <TableCell align="center" sx={{ width: 56 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography color={theme.palette.text.secondary} textAlign="center" variant="body2" sx={{ py: 2 }}>
                      {isFetching ? t({ id: 'auditLoading' }) : hasFilters ? t({ id: 'auditNoMatchingEvents' }) : t({ id: 'auditNoDataMessage' })}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                events.map((row) => {
                  const accent = eventTypeColor(row.eventType)
                  const allocation = row.allocations?.[0]
                  const projectTitle = allocation?.projectTitle
                  const milestoneTitle = allocation?.milestones?.[0]?.milestoneTitle

                  return (
                    <TableRow key={`${row.txHash}-${row.eventId}`} hover onClick={() => openDetail(row)} sx={{ cursor: 'pointer' }}>
                      <TableCell>
                        <Typography color={theme.palette.text.primary} variant="body2">
                          {formatAuditDate(row.date)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={t({ id: eventTypeLabelId(row.eventType) })}
                          sx={{ borderColor: accent, color: accent, backgroundColor: `${accent}14`, fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography color={theme.palette.text.primary} variant="body2">
                          {row.fundingId || '—'}
                        </Typography>
                        {row.fundingEntity && (
                          <Typography color={theme.palette.text.secondary} variant="caption">
                            {row.fundingEntity}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography color={theme.palette.text.primary} variant="body2">
                          {projectTitle || '—'}
                        </Typography>
                        {milestoneTitle && (
                          <Typography color={theme.palette.text.secondary} variant="caption">
                            {milestoneTitle}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Typography color={theme.palette.text.primary} variant="body2" sx={{ fontWeight: 600 }}>
                          {formatAuditAmount(row.totalAmount, row.currencyCustCode)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {row.txHash ? (
                          <Tooltip title={row.txHash}>
                            <Link
                              href={`${EXPLORER_TX_URL}${row.txHash}`}
                              rel="noreferrer"
                              target="_blank"
                              sx={{ alignItems: 'center', display: 'inline-flex', gap: 0.5, fontFamily: 'monospace', fontSize: '0.8125rem' }}
                              onClick={(event: MouseEvent<HTMLAnchorElement>) => event.stopPropagation()}>
                              {truncateHash(row.txHash)}
                              <ExportSquare color={theme.palette.action.active} size={16} variant="Outline" />
                            </Link>
                          </Tooltip>
                        ) : (
                          <Typography color={theme.palette.text.secondary} variant="body2">
                            —
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={t({ id: 'viewDetails' })}>
                          <IconButton
                            aria-label={t({ id: 'viewDetails' })}
                            size="small"
                            onClick={(event: MouseEvent<HTMLButtonElement>) => {
                              event.stopPropagation()
                              openDetail(row)
                            }}>
                            <Eye color={theme.palette.action.active} size={18} variant="Outline" />
                          </IconButton>
                        </Tooltip>
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
          rowsPerPageOptions={[10, 25, 50]}
          onPageChange={(_, newPage) => onPaginationChange(newPage, rowsPerPage)}
          onRowsPerPageChange={(event) => onPaginationChange(0, parseInt(event.target.value, 10))}
        />
      </Box>

      <Modal isOpen={isOpen} maxWidth="md" onClose={handleModalClose}>
        <Modal.Header hasCloseButton>{t({ id: 'eventDetailsTitle' })}</Modal.Header>
        <Modal.Content>{selectedEvent && <EventDetail event={selectedEvent} />}</Modal.Content>
      </Modal>
    </Box>
  )
}
