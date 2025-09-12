import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import dayjs from 'dayjs'
import { RefreshCircle } from 'iconsax-react'
import groupBy from 'lodash/groupBy'

import { BatchDetailsToolbar } from 'features/ui'
import { BatchApiResponse, TransactionApiResponse, ViolationSource } from 'libs/api-connectors/backend-connector-lob/api/batches/batchesApi.types.ts'
import { usePagination } from 'libs/hooks/usePagination.ts'
import { useSorting } from 'libs/hooks/useSorting.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ChipsGroup } from 'libs/ui-kit/components/ChipsGroup/ChipsGroup.component'
import { TableContainer } from 'libs/ui-kit/components/Table/Table.component.tsx'
import { TableColDef } from 'libs/ui-kit/components/Table/Table.types.ts'
import { createColumns } from 'libs/ui-kit/components/Table/Table.utils.ts'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { formatNumber } from 'libs/utils/format.ts'
import { TableReviewTransactionItems } from 'modules/review/components/TableReviewTransactionItems/TableReviewTransactionItems.component.tsx'
import { getItemsRejections, getTransactionViolationsBySource } from 'modules/review/utils/transactions.utils.ts'

interface CollapsablePendingTransactionItemsProps {
  transaction: TransactionApiResponse
}

const CollapsablePendingTransactionItems = ({ transaction }: CollapsablePendingTransactionItemsProps) => {
  const violationsGroupedByItemId = groupBy(transaction.violations, (violation) => violation.transactionItemId)

  return (
    <Box px={3} py={2}>
      <TableReviewTransactionItems data={transaction.items} violations={violationsGroupedByItemId} isFetching={false} hasReasonsForPending />
    </Box>
  )
}

interface BatchReviewPendingPagination {
  handlePagination: ReturnType<typeof usePagination>['handlePagination']
}

interface BatchReviewPendingSorting {
  handleSorting: ReturnType<typeof useSorting>['handleSorting']
}

interface TableBatchReviewPendingProps {
  data: BatchApiResponse | null
  pagination: BatchReviewPendingPagination
  sorting: BatchReviewPendingSorting
  isFetching: boolean
  isReprocessing: boolean
}

export const TableBatchReviewPending = ({ data, pagination, sorting, isFetching, isReprocessing }: TableBatchReviewPendingProps) => {
  const { handlePagination } = pagination
  const { handleSorting } = sorting

  const { t } = useTranslations()

  const theme = useTheme()

  const columns = createColumns<TransactionApiResponse>()([
    {
      field: 'internalTransactionNumber',
      headerName: t({ id: 'transactionId' }),
      renderCell: (row) => (
        <Tooltip title={`Transaction ID: ${row.id}`}>
          <Box component="span">{row.internalTransactionNumber}</Box>
        </Tooltip>
      ),
      align: 'left',
      headerAlign: 'left',
      sortable: true,
      width: 'auto'
    },
    {
      field: 'entryDate',
      headerName: t({ id: 'transactionDate' }),
      valueFormatter: (value) => dayjs(value).format('DD/MM/YYYY'),
      align: 'left',
      headerAlign: 'left',
      sortable: true,
      width: 'auto'
    },
    { field: 'transactionType', headerName: t({ id: 'transactionType' }), align: 'left', headerAlign: 'left', sortable: true, width: 'auto' },
    {
      field: 'amountTotalLcy',
      headerName: t({ id: 'totalAmountLCY' }),
      valueFormatter: (value) => formatNumber(value),
      align: 'right',
      headerAlign: 'right',
      sortable: true,
      width: 'auto'
    },
    {
      field: 'items',
      headerName: t({ id: 'numberOfItems' }),
      valueGetter: (_, row) => row.items.length,
      valueFormatter: (value) => formatNumber(value, { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
      align: 'right',
      headerAlign: 'right',
      sortable: true,
      width: 'auto'
    },
    {
      field: 'violations',
      headerName: t({ id: 'reasonForPending' }),
      renderCell: (row) => {
        const violationsGroupedByItemId = groupBy(row.violations, (violation) => violation.transactionItemId)
        const transactionLobViolations = getTransactionViolationsBySource(violationsGroupedByItemId, ViolationSource.LOB)
        const itemRejections = getItemsRejections(row.items)
        const reasonsForPending = Array.from(row.itemRejection ? itemRejections : transactionLobViolations)

        return <ChipsGroup content={reasonsForPending} />
      },
      align: 'left',
      headerAlign: 'left',
      sortable: true,
      width: 'auto'
    },
    ...(isReprocessing
      ? [
          {
            field: 'status',
            headerName: '',
            renderCell: () => (
              <Tooltip title={t({ id: 'transactionReprocessingStatus' })}>
                <RefreshCircle color={theme.palette.action.active} size={24} variant="Bold" />
              </Tooltip>
            ),
            align: 'center',
            width: '72px'
          } as TableColDef<TransactionApiResponse>
        ]
      : [])
  ])

  return (
    <TableContainer>
      <TableContainer.Toolbar>
        <BatchDetailsToolbar />
      </TableContainer.Toolbar>
      <TableContainer.Table
        aria-label="batch-review-pending-table"
        initialState={{
          sorting: {
            sortModel: [{ field: 'entryDate', sort: 'desc' }]
          }
        }}
        columns={columns}
        noRowsHint={t({ id: 'noTransactionsWithStatusHint' })}
        noRowsMessage={t({ id: 'nothingHereMessage' })}
        paginationMode="server"
        sortingMode="server"
        totalRows={data?.batchStatistics.pending}
        rows={data?.transactions ?? []}
        sx={{ minWidth: '93.75rem' }}
        collapsableRow={(transaction) => <CollapsablePendingTransactionItems transaction={transaction as TransactionApiResponse} />}
        onPagination={handlePagination}
        onSortChange={handleSorting}
        isLoading={isFetching}
      />
    </TableContainer>
  )
}
