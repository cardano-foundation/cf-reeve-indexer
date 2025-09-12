import Box from '@mui/material/Box'
import dayjs from 'dayjs'
import groupBy from 'lodash/groupBy'

import { BatchDetailsToolbar } from 'features/ui'
import { BatchApiResponse, TransactionApiResponse, ViolationSource } from 'libs/api-connectors/backend-connector-lob/api/batches/batchesApi.types.ts'
import { usePagination } from 'libs/hooks/usePagination.ts'
import { useSorting } from 'libs/hooks/useSorting.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ChipsGroup } from 'libs/ui-kit/components/ChipsGroup/ChipsGroup.component'
import { TableContainer } from 'libs/ui-kit/components/Table/Table.component.tsx'
import { createColumns } from 'libs/ui-kit/components/Table/Table.utils.ts'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { formatNumber } from 'libs/utils/format.ts'
import { TableReviewTransactionItems } from 'modules/review/components/TableReviewTransactionItems/TableReviewTransactionItems.component.tsx'
import { getItemsRejections, getTransactionViolationsBySource } from 'modules/review/utils/transactions.utils.ts'

interface CollapsableInvalidTransactionItemsProps {
  transaction: TransactionApiResponse
}

const CollapsableInvalidTransactionItems = ({ transaction }: CollapsableInvalidTransactionItemsProps) => {
  const violationsGroupedByItemId = groupBy(transaction.violations, (violation) => violation.transactionItemId)

  return (
    <Box px={3} py={2}>
      <TableReviewTransactionItems data={transaction.items} violations={violationsGroupedByItemId} isFetching={false} hasReasonsForRejection />
    </Box>
  )
}

interface BatchReviewInvalidPagination {
  handlePagination: ReturnType<typeof usePagination>['handlePagination']
}

interface BatchReviewInvalidSorting {
  handleSorting: ReturnType<typeof useSorting>['handleSorting']
}

interface TableBatchReviewInvalidProps {
  data: BatchApiResponse | null
  pagination: BatchReviewInvalidPagination
  sorting: BatchReviewInvalidSorting
  isFetching: boolean
}

export const TableBatchReviewInvalid = ({ data, pagination, sorting, isFetching }: TableBatchReviewInvalidProps) => {
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
    },
    {
      field: 'violations',
      headerName: t({ id: 'reasonForRejection' }),
      renderCell: (row) => {
        const violationsGroupedByItemId = groupBy(row.violations, (violation) => violation.transactionItemId)
        const transactionErpViolations = getTransactionViolationsBySource(violationsGroupedByItemId, ViolationSource.ERP)
        const itemRejections = getItemsRejections(row.items)
        const reasonsForRejection = Array.from(row.itemRejection ? itemRejections : transactionErpViolations)

        return <ChipsGroup content={reasonsForRejection} />
      },
      align: 'left',
      headerAlign: 'left',
      sortable: true,
      width: '17.5%'
    }
  ])

  return (
    <TableContainer>
      <TableContainer.Toolbar>
        <BatchDetailsToolbar />
      </TableContainer.Toolbar>
      <TableContainer.Table
        aria-label="batch-review-invalid-table"
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
        totalRows={data?.batchStatistics.invalid}
        rows={data?.transactions ?? []}
        sx={{ minWidth: '93.75rem' }}
        collapsableRow={(transaction) => <CollapsableInvalidTransactionItems transaction={transaction as TransactionApiResponse} />}
        onPagination={handlePagination}
        onSortChange={handleSorting}
        isLoading={isFetching}
      />
    </TableContainer>
  )
}
