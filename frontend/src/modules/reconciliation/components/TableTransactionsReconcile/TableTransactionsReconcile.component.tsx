import { useMediaQuery, useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import dayjs from 'dayjs'
import { Check } from 'iconsax-react'

import { GetReconciledTransactionsApiResponse, TransactionReconcileApiResponse } from 'libs/api-connectors/backend-connector-lob/api/reconciliation/reconciliationApi.types.ts'
import { usePagination } from 'libs/hooks/usePagination.ts'
import { hasPermission } from 'libs/permissions/has-permission.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonPrimary } from 'libs/ui-kit/components/ButtonPrimary/ButtonPrimary.component.tsx'
import { TableContainer } from 'libs/ui-kit/components/Table/Table.component.tsx'
import { TableColDef } from 'libs/ui-kit/components/Table/Table.types.ts'
import { createColumns } from 'libs/ui-kit/components/Table/Table.utils.ts'
import { TableTransactionItems } from 'libs/ui-kit/components/TableTransactionItems/TableTransactionItems.component.tsx'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { formatNumber } from 'libs/utils/format.ts'
import { ReconciliationRejectionReasons } from 'modules/reconciliation/components/ReconciliationRejectionReasons/ReconciliationRejectionReasons.component.tsx'

interface CollapsableTransactionItemsProps {
  transaction: TransactionReconcileApiResponse
}

const CollapsableTransactionItems = ({ transaction }: CollapsableTransactionItemsProps) => {
  return (
    <Box px={3} py={2}>
      <TableTransactionItems data={transaction.items} isFetching={false} />
    </Box>
  )
}

interface TransactionsReconciledPagination {
  handlePagination: ReturnType<typeof usePagination>['handlePagination']
}

interface TableTransactionsReconcileProps {
  data: GetReconciledTransactionsApiResponse | null
  pagination: TransactionsReconciledPagination
  onReconciliationDialogOpen: () => void
  hasBeenReconciled: boolean | null
  isFetching: boolean
  isUnreconciled?: boolean
}

export const TableTransactionsReconcile = ({
  data,
  pagination,
  onReconciliationDialogOpen,
  hasBeenReconciled,
  isFetching,
  isUnreconciled = false
}: TableTransactionsReconcileProps) => {
  const { handlePagination } = pagination

  const { t } = useTranslations()

  const theme = useTheme()

  const isDesktopDown = useMediaQuery(theme.breakpoints.down('xl'))

  const columns = createColumns<TransactionReconcileApiResponse>()([
    {
      field: 'reconciliationDate',
      headerName: t({ id: 'reconciliationDate' }),
      valueFormatter: (value) => dayjs(value).format('DD/MM/YYYY'),
      align: 'left',
      headerAlign: 'left',
      sortable: true,
      width: '20%'
    },
    {
      field: 'dataSource',
      headerName: t({ id: 'source' }),
      align: 'left',
      headerAlign: 'left',
      sortable: true,
      width: 'auto'
    },
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
    {
      field: 'transactionType',
      headerName: t({ id: 'transactionType' }),
      align: 'left',
      headerAlign: 'left',
      sortable: true,
      width: 'auto'
    },
    {
      field: 'amountTotalLcy',
      headerName: t({ id: 'totalAmountLCY' }),
      valueFormatter: (value) => formatNumber(value),
      align: 'right',
      headerAlign: 'right',
      sortable: true,
      width: 'auto'
    },
    ...(isUnreconciled
      ? [
          {
            field: 'reconciliationRejectionCode',
            headerName: t({ id: 'status' }),
            renderCell: (row) => <ReconciliationRejectionReasons rejectionCodes={row.reconciliationRejectionCode} />,
            align: 'left',
            headerAlign: 'left',
            sortable: true,
            width: 'auto'
          } as TableColDef<TransactionReconcileApiResponse>
        ]
      : [])
  ])

  return (
    <TableContainer sx={{ maxHeight: isDesktopDown ? '40.5rem' : 'initial' }}>
      <TableContainer.Table
        aria-label="transactions-reconciled-table"
        initialState={{
          sorting: {
            sortModel: [{ field: 'reconciliationDate', sort: 'desc' }]
          }
        }}
        columns={columns}
        noRowsAction={
          hasPermission('transactions', 'reconcilate') && !hasBeenReconciled ? (
            <ButtonPrimary startIcon={<Check size={20} variant="Bold" onClick={onReconciliationDialogOpen} />}>{t({ id: 'reconcileTransactions' })}</ButtonPrimary>
          ) : undefined
        }
        noRowsHint={t({
          id: !hasBeenReconciled ? (hasPermission('transactions', 'reconcilate') ? 'reconcileTransactionsHint' : 'noReconciledTransactionsHint') : 'noTransactionsWithStatusHint'
        })}
        noRowsMessage={t({ id: 'nothingHereMessage' })}
        paginationMode="server"
        sortingMode="client"
        totalRows={data?.total}
        rows={data?.transactions}
        sx={{ minWidth: '93.75rem' }}
        collapsableRow={(transaction) => {
          const hasItems = transaction.items && transaction.items.length > 0

          return hasItems ? <CollapsableTransactionItems transaction={transaction as TransactionReconcileApiResponse} /> : null
        }}
        onPagination={handlePagination}
        isLoading={isFetching}
      />
    </TableContainer>
  )
}
