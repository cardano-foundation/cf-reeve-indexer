import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'
import { ExportSquare } from 'iconsax-react'
import { useMemo, useRef } from 'react'

import { EventView, PostPublicEventsResponse200 } from 'libs/api-connectors/backend-connector-reeve/api/events/publicEventsApi.types'
import { usePagination } from 'libs/hooks/usePagination'
import { useSorting } from 'libs/hooks/useSorting'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { TruncatedCellText } from 'libs/ui-kit/components/CellText/TruncatedCellText.component.tsx'
import { CounterChipStyled } from 'libs/ui-kit/components/ChipsGroup/ChipsGroup.styles.tsx'
import { TableContainer } from 'libs/ui-kit/components/Table/Table.component.tsx'
import { createColumns } from 'libs/ui-kit/components/Table/Table.utils.ts'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { formatNumber } from 'libs/utils/format.ts'
import { EventAllocationBreakdown } from 'modules/public-events/components/EventAllocationBreakdown/EventAllocationBreakdown.component.tsx'
import { SearchToolbar } from 'modules/public-events/components/SearchToolbar/SearchToolbar.component'

interface SearchedEventsProps {
  data: PostPublicEventsResponse200 | null
  pagination: ReturnType<typeof usePagination>
  sorting: ReturnType<typeof useSorting>
  hasFiltersSelected: boolean
  isLoading: boolean
}

interface EventRow extends EventView {
  projectTitles: string[]
}

export const SearchedEvents = ({ data, pagination, sorting, hasFiltersSelected, isLoading }: SearchedEventsProps) => {
  const { rowsPerPage, handlePagination } = pagination
  const { handleSorting } = sorting

  const { t } = useTranslations()

  const theme = useTheme()

  const rowCountRef = useRef(data?.total || 0)

  const rowCount = useMemo(() => {
    if (data?.total !== undefined) {
      rowCountRef.current = data.total
    }

    return rowCountRef.current
  }, [data?.total])

  const rows: EventRow[] = (data?.events ?? []).map((event) => ({
    ...event,
    projectTitles: Array.from(new Set(event.allocations.map((allocation) => allocation.projectTitle || allocation.projectId)))
  }))

  const columns = createColumns<EventRow>()([
    {
      field: 'eventType',
      headerName: t({ id: 'eventType' }),
      hideable: false,
      sortable: true,
      width: 150,
      renderCell: (row) => <TruncatedCellText value={row.eventType} />
    },
    {
      field: 'projectTitles',
      headerName: t({ id: 'auditProjectTitle' }),
      hideable: false,
      sortable: false,
      width: 230,
      renderCell: (row) => {
        const [firstProjectTitle, ...remainingProjectTitles] = row.projectTitles

        return (
          <Box alignItems="center" display="flex" gap={1}>
            <TruncatedCellText value={firstProjectTitle ?? '-'} />
            {remainingProjectTitles.length > 0 && (
              <Tooltip title={remainingProjectTitles.join('\n')}>
                <CounterChipStyled label={`+${remainingProjectTitles.length}`} size="small" />
              </Tooltip>
            )}
          </Box>
        )
      }
    },
    {
      field: 'totalAmount',
      headerName: t({ id: 'amountRcy' }),
      align: 'right',
      headerAlign: 'right',
      hideable: false,
      sortable: true,
      width: 170,
      renderCell: (row) => <TruncatedCellText value={row.totalAmount || row.totalAmount === 0 ? formatNumber(row.totalAmount) : '-'} />
    },
    {
      field: 'currencyCustCode',
      headerName: t({ id: 'currency' }),
      hideable: false,
      sortable: false,
      width: 120,
      renderCell: (row) => <TruncatedCellText value={row.currencyCustCode ?? '-'} />
    },
    {
      field: 'date',
      headerName: t({ id: 'eventDate' }),
      hideable: false,
      sortable: true,
      width: 150,
      renderCell: (row) => <TruncatedCellText value={row.date ? dayjs(row.date, 'YYYY-MM-DD').format('DD/MM/YYYY') : '-'} />
    },
    {
      field: 'txHash',
      headerName: t({ id: 'blockchainHash' }),
      hideable: false,
      sortable: true,
      width: 130,
      renderCell: (row) =>
        row.txHash ? (
          <Box alignItems="center" display="flex" gap={1}>
            <Tooltip title={row.txHash}>
              <Typography component="span" variant="body2">{`${row.txHash.slice(0, 4)}...${row.txHash.slice(-4)}`}</Typography>
            </Tooltip>
            <Tooltip title={t({ id: 'openInExplorer' })}>
              <Link display="flex" href={`https://explorer.cardano.org/transaction/${row.txHash}`} rel="noreferrer" target="_blank" onClick={(event) => event.stopPropagation()}>
                <ExportSquare color={theme.palette.action.active} size={20} variant="Outline" />
              </Link>
            </Tooltip>
          </Box>
        ) : null
    },
    {
      field: 'fundingEntity',
      headerName: t({ id: 'fundingEntity' }),
      hideable: true,
      sortable: false,
      width: 180,
      renderCell: (row) => <TruncatedCellText value={row.fundingEntity ?? '-'} />
    },
    {
      field: 'fundingId',
      headerName: t({ id: 'fundingId' }),
      hideable: true,
      sortable: false,
      width: 160,
      renderCell: (row) => <TruncatedCellText value={row.fundingId ?? '-'} />
    },
    {
      field: 'fundingTx',
      headerName: t({ id: 'fundingTransaction' }),
      hideable: true,
      sortable: false,
      width: 200,
      renderCell: (row) => <TruncatedCellText value={row.fundingTx ?? '-'} />
    },
    {
      field: 'spendingCategory',
      headerName: t({ id: 'spendingCategory' }),
      hideable: true,
      sortable: false,
      width: 180,
      renderCell: (row) => <TruncatedCellText value={row.spendingCategory ?? '-'} />
    },
    {
      field: 'vendor',
      headerName: t({ id: 'vendor' }),
      hideable: true,
      sortable: false,
      width: 160,
      renderCell: (row) => <TruncatedCellText value={row.vendor ?? '-'} />
    },
    {
      field: 'amountFcy',
      headerName: t({ id: 'amountFcy' }),
      align: 'right',
      headerAlign: 'right',
      hideable: true,
      sortable: false,
      width: 150,
      renderCell: (row) => <TruncatedCellText value={row.amountFcy || row.amountFcy === 0 ? formatNumber(row.amountFcy) : '-'} />
    },
    {
      field: 'currencyFcyCustCode',
      headerName: t({ id: 'foreignCurrency' }),
      hideable: true,
      sortable: false,
      width: 120,
      renderCell: (row) => <TruncatedCellText value={row.currencyFcyCustCode ?? '-'} />
    },
    {
      field: 'fxRate',
      headerName: t({ id: 'exchangeRate' }),
      hideable: true,
      sortable: false,
      width: 130,
      renderCell: (row) => <TruncatedCellText value={row.fxRate ?? '-'} />
    },
    {
      field: 'hash',
      headerName: t({ id: 'documentHash' }),
      hideable: true,
      sortable: false,
      width: 200,
      renderCell: (row) => <TruncatedCellText value={row.hash ?? '-'} />
    },
    {
      field: 'notes',
      headerName: t({ id: 'notes' }),
      hideable: true,
      sortable: false,
      width: 240,
      renderCell: (row) => <TruncatedCellText value={row.notes ?? '-'} />
    }
  ])

  return (
    <TableContainer>
      <TableContainer.Toolbar>
        <SearchToolbar />
      </TableContainer.Toolbar>
      <TableContainer.Table
        aria-label={t({ id: 'eventsTable' })}
        initialState={{
          columns: {
            columnVisibilityModel: {
              fundingEntity: false,
              fundingId: false,
              fundingTx: false,
              spendingCategory: false,
              amountFcy: false,
              currencyFcyCustCode: false,
              vendor: false,
              fxRate: false,
              hash: false,
              notes: false
            }
          },
          sorting: {
            sortModel: [{ field: 'date', sort: 'desc' }]
          }
        }}
        noRowsHint={t({ id: 'noPublicEventsHint' }, { organisation: 'Cardano Foundation' })}
        noRowsMessage={t({ id: 'nothingHereMessage' })}
        columns={columns}
        rows={rows}
        getRowId={(row) => row.id.toString()}
        collapsableRow={(row) => (row.allocations.length > 0 ? <EventAllocationBreakdown allocations={row.allocations} /> : null)}
        paginationMode="server"
        sortingMode="server"
        totalRows={rowCount}
        pageSize={rowsPerPage}
        onPagination={(newPage, newRowsPerPage) => handlePagination(newPage, newRowsPerPage)}
        onSortChange={(field, order) => handleSorting(field.toString(), order)}
        hasFiltersSelected={hasFiltersSelected}
        isLoading={isLoading}
        sx={{ minWidth: '75rem' }}
      />
    </TableContainer>
  )
}