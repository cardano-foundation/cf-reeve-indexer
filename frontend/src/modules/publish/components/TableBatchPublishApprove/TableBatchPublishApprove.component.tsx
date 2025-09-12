import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import dayjs from 'dayjs'
import { Dispatch, SetStateAction } from 'react'

import { BatchDetailsToolbar } from 'features/ui'
import { BatchApiResponse, TransactionApiResponse } from 'libs/api-connectors/backend-connector-lob/api/batches/batchesApi.types.ts'
import { TransactionItemsRejection } from 'libs/api-connectors/backend-connector-lob/api/transactions/transactionsApi.types.ts'
import { usePagination } from 'libs/hooks/usePagination.ts'
import { useSorting } from 'libs/hooks/useSorting.ts'
import { hasPermission } from 'libs/permissions/has-permission.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonSecondary } from 'libs/ui-kit/components/ButtonSecondary/ButtonSecondary.component.tsx'
import { ModalAction } from 'libs/ui-kit/components/ModalAction/ModalAction.component.tsx'
import { TableContainer } from 'libs/ui-kit/components/Table/Table.component.tsx'
import { createColumns } from 'libs/ui-kit/components/Table/Table.utils.ts'
import { TableTransactionItemsReject } from 'libs/ui-kit/components/TableTransactionItemsReject/TableTransactionItemsReject.component.tsx'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { formatNumber } from 'libs/utils/format.ts'
import { TablePublishTransactionItems } from 'modules/publish/components/TablePublishTransactionItems/TablePublishTransactionItems.component.tsx'

interface CollapsableApproveTransactionItemsProps {
  transaction: TransactionApiResponse
}

const CollapsableApproveTransactionItems = ({ transaction }: CollapsableApproveTransactionItemsProps) => {
  return (
    <Box px={3} py={2}>
      <TablePublishTransactionItems data={transaction.items} isFetching={false} />
    </Box>
  )
}

interface BatchPublishPagination {
  handlePagination: ReturnType<typeof usePagination>['handlePagination']
}

interface BatchPublishSorting {
  handleSorting: ReturnType<typeof useSorting>['handleSorting']
}

interface TableBatchPublishApproveProps {
  data: BatchApiResponse | null
  pagination: BatchPublishPagination
  sorting: BatchPublishSorting
  onPublishTransaction: (transactionId: string) => void
  onRejectTransaction: (transactionId: string) => void
  onSelectionChange: (selectedIds: string[]) => void
  onTransactionRejectionReasonsChange: Dispatch<SetStateAction<TransactionItemsRejection[]>>
  transactionsRejectionReasons: TransactionItemsRejection[]
  isFetching: boolean
}

export const TableBatchPublishApprove = ({
  data,
  pagination,
  sorting,
  onPublishTransaction,
  onRejectTransaction,
  onSelectionChange,
  onTransactionRejectionReasonsChange,
  transactionsRejectionReasons,
  isFetching
}: TableBatchPublishApproveProps) => {
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
      field: 'actions',
      headerName: '',
      renderCell: (row, { isRowChecked, isRowExpanded }) => {
        const isAnyRejectionReasonProvided = row.items.some((transaction) => transactionsRejectionReasons.find((reason) => transaction.id === reason.txItemId))
        return (
          <Box display="flex" gap={1} justifyContent="flex-end">
            <ModalAction
              aria-label={t({ id: 'modalActionPublishSingleTitle' })}
              message={t({ id: 'modalActionPublishSingleMessage' })}
              primaryActionLabel={t({ id: 'confirm' })}
              secondaryActionLabel={t({ id: 'cancel' })}
              primaryActionOnClick={() => onPublishTransaction(row.id)}
              isModalDisabled={isRowChecked}
              renderButton={({ handleClickOpen, isModalDisabled }) => (
                <ButtonSecondary
                  color="secondary"
                  size="small"
                  sx={{ color: theme.palette.secondary.dark, borderColor: theme.palette.secondary.main, '&:hover': { borderColor: theme.palette.secondary.dark } }}
                  onClick={handleClickOpen}
                  disabled={isModalDisabled || !hasPermission('transactions', 'publish_approve')}
                >
                  {t({ id: 'publish' })}
                </ButtonSecondary>
              )}
            />
            {isRowExpanded && (
              <ModalAction
                aria-label={t({ id: 'modalActionRejectTitle' })}
                message={t({ id: 'modalActionRejectMessage' })}
                primaryActionLabel={t({ id: 'confirm' })}
                secondaryActionLabel={t({ id: 'cancel' })}
                primaryActionOnClick={() => onRejectTransaction(row.id)}
                secondaryActionOnClick={() => onTransactionRejectionReasonsChange([])}
                isPrimaryButtonDisabled={!isAnyRejectionReasonProvided}
                isModalDisabled={isRowChecked}
                maxWidth="xl"
                renderButton={({ handleClickOpen, isModalDisabled }) => (
                  <ButtonSecondary
                    color="error"
                    size="small"
                    sx={{ color: theme.palette.error.dark, borderColor: theme.palette.error.main, '&:hover': { borderColor: theme.palette.error.dark } }}
                    onClick={handleClickOpen}
                    disabled={isModalDisabled || !hasPermission('transactions', 'publish_reject')}
                  >
                    {t({ id: 'reject' })}
                  </ButtonSecondary>
                )}
              >
                <Box mt={3}>
                  <TableTransactionItemsReject data={row.items} onTransactionRejectionReasonsChange={onTransactionRejectionReasonsChange} isFetching={false} />
                </Box>
              </ModalAction>
            )}
          </Box>
        )
      },
      align: 'right',
      headerAlign: 'right',
      sortable: false,
      sticky: true,
      width: '175px'
    }
  ])

  return (
    <TableContainer>
      <TableContainer.Toolbar>
        <BatchDetailsToolbar />
      </TableContainer.Toolbar>
      <TableContainer.Table
        aria-label="batch-publish-approve-table"
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
        collapsableRow={(transaction) => <CollapsableApproveTransactionItems transaction={transaction as TransactionApiResponse} />}
        onPagination={handlePagination}
        onSelectionChange={onSelectionChange}
        onSortChange={handleSorting}
        isLoading={isFetching}
        checkboxSelection
      />
    </TableContainer>
  )
}
