import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import dayjs from 'dayjs'
import { Danger, RefreshCircle } from 'iconsax-react'

import { BatchDetailsToolbar } from 'features/ui'
import { BatchApiResponse, BatchBlockchainStatus, TransactionApiResponse } from 'libs/api-connectors/backend-connector-lob/api/batches/batchesApi.types.ts'
import { usePagination } from 'libs/hooks/usePagination.ts'
import { useSorting } from 'libs/hooks/useSorting.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { TableContainer } from 'libs/ui-kit/components/Table/Table.component.tsx'
import { createColumns } from 'libs/ui-kit/components/Table/Table.utils.ts'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { formatNumber } from 'libs/utils/format.ts'
import { TablePublishTransactionItems } from 'modules/publish/components/TablePublishTransactionItems/TablePublishTransactionItems.component.tsx'

interface CollapsableApprovedTransactionItemsProps {
  transaction: TransactionApiResponse
}

const CollapsableApprovedTransactionItems = ({ transaction }: CollapsableApprovedTransactionItemsProps) => {
  return (
    <Box px={3} py={2}>
      <TablePublishTransactionItems data={transaction.items} isFetching={false} />
    </Box>
  )
}

interface BatchPublishedPagination {
  handlePagination: ReturnType<typeof usePagination>['handlePagination']
}

interface BatchPublishedSorting {
  handleSorting: ReturnType<typeof useSorting>['handleSorting']
}

interface TableBatchPublishApprovedProps {
  data: BatchApiResponse | null
  pagination: BatchPublishedPagination
  sorting: BatchPublishedSorting
  isFetching: boolean
}

export const TableBatchPublishApproved = ({ data, pagination, sorting, isFetching }: TableBatchPublishApprovedProps) => {
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
      field: 'ledgerDispatchStatus',
      headerName: '',
      renderCell: (row) => {
        const { ledgerDispatchStatus } = row

        if (ledgerDispatchStatus === BatchBlockchainStatus.FAILED) {
          return (
            <Tooltip title={t({ id: 'batchBlockchainFailedTooltip' })} placement="left">
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Danger color={theme.palette.error.dark} size={24} variant="Bold" />
              </Box>
            </Tooltip>
          )
        }

        if (ledgerDispatchStatus !== BatchBlockchainStatus.FINALIZED) {
          return (
            <Tooltip title={t({ id: 'batchBlockchainProcessingTooltip' })} placement="left">
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <RefreshCircle color={theme.palette.primary.dark} size={24} variant="Bold" />
              </Box>
            </Tooltip>
          )
        }

        return null
      },
      align: 'left',
      headerAlign: 'left',
      width: '68px'
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
        totalRows={data?.batchStatistics.published}
        rows={data?.transactions ?? []}
        sx={{ minWidth: '93.75rem' }}
        collapsableRow={(transaction) => <CollapsableApprovedTransactionItems transaction={transaction} />}
        onPagination={handlePagination}
        onSortChange={handleSorting}
        isLoading={isFetching}
      />
    </TableContainer>
  )
}
