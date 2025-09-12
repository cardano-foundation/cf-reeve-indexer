import Box from '@mui/material/Box'
import dayjs from 'dayjs'

import { BatchDetailsToolbar } from 'features/ui'
import { BatchApiResponse, TransactionApiResponse } from 'libs/api-connectors/backend-connector-lob/api/batches/batchesApi.types.ts'
import { usePagination } from 'libs/hooks/usePagination.ts'
import { useSorting } from 'libs/hooks/useSorting.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { TableContainer } from 'libs/ui-kit/components/Table/Table.component.tsx'
import { createColumns } from 'libs/ui-kit/components/Table/Table.utils.ts'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { formatNumber } from 'libs/utils/format.ts'
import { TableReviewTransactionItems } from 'modules/review/components/TableReviewTransactionItems/TableReviewTransactionItems.component.tsx'

interface CollapsableApprovedTransactionItemsProps {
  transaction: TransactionApiResponse
}

const CollapsableApprovedTransactionItems = ({ transaction }: CollapsableApprovedTransactionItemsProps) => {
  return (
    <Box px={3} py={2}>
      <TableReviewTransactionItems data={transaction.items} isFetching={false} />
    </Box>
  )
}

interface BatchReviewApprovedPagination {
  handlePagination: ReturnType<typeof usePagination>['handlePagination']
}

interface BatchReviewApprovedSorting {
  handleSorting: ReturnType<typeof useSorting>['handleSorting']
}

interface TableBatchReviewApprovedProps {
  data: BatchApiResponse | null
  pagination: BatchReviewApprovedPagination
  sorting: BatchReviewApprovedSorting
  isFetching: boolean
}

export const TableBatchReviewApproved = ({ data, pagination, sorting, isFetching }: TableBatchReviewApprovedProps) => {
  const { handlePagination } = pagination
  const { handleSorting } = sorting

  const { t } = useTranslations()

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
    }
  ])

  return (
    <TableContainer>
      <TableContainer.Toolbar>
        <BatchDetailsToolbar />
      </TableContainer.Toolbar>
      <TableContainer.Table
        aria-label="batch-review-approved-table"
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
        totalRows={data?.batchStatistics.publish}
        rows={data?.transactions ?? []}
        sx={{ minWidth: '93.75rem' }}
        collapsableRow={(transaction) => <CollapsableApprovedTransactionItems transaction={transaction as TransactionApiResponse} />}
        onPagination={handlePagination}
        onSortChange={handleSorting}
        isLoading={isFetching}
      />
    </TableContainer>
  )
}
