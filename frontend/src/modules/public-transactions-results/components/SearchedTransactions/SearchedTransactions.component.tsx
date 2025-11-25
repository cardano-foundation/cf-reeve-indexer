import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { GridColDef } from '@mui/x-data-grid'
import dayjs from 'dayjs'
import { ExportSquare } from 'iconsax-react'
import { useMemo, useRef } from 'react'

import { PublicTransactionResponse } from 'libs/api-connectors/backend-connector-reeve/api/transactions/publicTransactionsApi.types.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { CellCodeDetails } from 'libs/ui-kit/components/CellCodeDetails/CellCodeDetails.component.tsx'
import { DataGridContainer } from 'libs/ui-kit/components/DataGrid/DataGridContainer.component.tsx'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { formatNumber, formatNumberPercentage } from 'libs/utils/format.ts'

interface SearchedTransactionsProps {
  pagination: { page: number; rowsPerPage: number }
  rows: PublicTransactionResponse[]
  total?: number
  onPagination: (page: number, rowsPerPage: number) => void
  isLoading: boolean
}

export const SearchedTransactions = ({ pagination, rows, total, onPagination, isLoading }: SearchedTransactionsProps) => {
  const { t } = useTranslations()

  const theme = useTheme()

  const rowCountRef = useRef(total || 0)

  const rowCount = useMemo(() => {
    if (total !== undefined) {
      rowCountRef.current = total
    }

    return rowCountRef.current
  }, [total])

  const columns: GridColDef[] = [
    {
      field: 'blockChainHash',
      headerName: t({ id: 'blockchainHash' }),
      renderCell: ({ value }) => (
        <Box alignItems="center" display="flex" gap={1}>
          <Tooltip title={value}>
            <Typography component="span" variant="body2">{`${value.slice(0, 4)}...${value.slice(-4)}`}</Typography>
          </Tooltip>
          <Tooltip title={t({ id: 'openInExplorer' })}>
            <Link display="flex" href={`https://explorer.cardano.org/transaction/${value}`} rel="noreferrer" target="_blank">
              <ExportSquare color={theme.palette.action.active} size={20} variant="Outline" />
            </Link>
          </Tooltip>
        </Box>
      ),
      hideable: false,
      sortable: true,
      flex: 1,
      minWidth: 192
    },
    {
      field: 'transactionInternalNumber',
      headerName: t({ id: 'transactionNumber' }),
      hideable: false,
      sortable: true,
      flex: 1,
      maxWidth: 192
    },
    {
      field: 'entryDate',
      headerName: t({ id: 'transactionDate' }),
      valueFormatter: (value) => dayjs(value, 'YYYY-MM-DD').format('DD/MM/YYYY'),
      hideable: false,
      sortable: true,
      flex: 1,
      minWidth: 192
    },
    { field: 'transactionType', headerName: t({ id: 'transactionType' }), hideable: true, sortable: true, flex: 1, minWidth: 192 },
    { field: 'documentNumber', headerName: t({ id: 'documentNumber' }), hideable: true, sortable: true, flex: 1, minWidth: 192 },
    { field: 'documentCurrencyCustomerCode', headerName: t({ id: 'currency' }), hideable: false, sortable: true, flex: 1, minWidth: 192 },
    {
      field: 'amountFcy',
      headerName: t({ id: 'amountFCY' }),
      valueFormatter: (value) => formatNumber(value),
      align: 'right',
      headerAlign: 'right',
      hideable: false,
      sortable: true,
      flex: 1,
      minWidth: 192
    },
    {
      field: 'amountLcy',
      headerName: t({ id: 'amountLCY' }),
      valueFormatter: (value) => formatNumber(value),
      align: 'right',
      headerAlign: 'right',
      hideable: false,
      sortable: true,
      flex: 1,
      minWidth: 192
    },
    {
      field: 'fxRate',
      headerName: t({ id: 'exchangeRate' }),
      renderCell: ({ value }) => formatNumber(value, { minimumFractionDigits: 5, maximumFractionDigits: 5 }),
      align: 'right',
      headerAlign: 'right',
      hideable: false,
      sortable: true,
      flex: 1,
      minWidth: 192
    },
    {
      field: 'vatRate',
      headerName: t({ id: 'vatRate' }),
      valueFormatter: (value) => formatNumberPercentage(value),
      align: 'right',
      headerAlign: 'right',
      hideable: true,
      sortable: true,
      flex: 1,
      minWidth: 192
    },
    {
      field: 'vatCustomerCode',
      headerName: t({ id: 'vatCode' }),
      hideable: true,
      sortable: true,
      flex: 1,
      minWidth: 192
    },
    {
      field: 'costCenter',
      headerName: t({ id: 'costCenter' }),
      valueGetter: (_, row) => row.costCenterCustomerCode,
      renderCell: ({ row }) => <CellCodeDetails code={row.costCenterCustomerCode} description={row.costCenterName} />,
      hideable: true,
      sortable: true,
      flex: 1,
      minWidth: 192
    },
    {
      field: 'project',
      headerName: t({ id: 'projectCode' }),
      valueGetter: (_, row) => row.projectCustomerCode,
      renderCell: ({ row }) => <CellCodeDetails code={row.projectCustomerCode} description={row.projectName} />,
      hideable: true,
      sortable: true,
      flex: 1,
      minWidth: 192
    },
    {
      field: 'counterpartyCustomerCode',
      headerName: t({ id: 'counterpartyCode' }),
      hideable: true,
      sortable: true,
      flex: 1,
      minWidth: 192
    },
    {
      field: 'counterpartyType',
      headerName: t({ id: 'counterpartyType' }),
      hideable: true,
      sortable: true,
      flex: 1,
      minWidth: 192
    },
    {
      field: 'accountEvent',
      headerName: t({ id: 'event' }),
      valueGetter: (_, row) => row.accountEventCode,
      renderCell: ({ row }) => <CellCodeDetails code={row.accountEventCode} description={row.accountEventName} />,
      hideable: false,
      sortable: true,
      flex: 1,
      minWidth: 240
    }
  ]

  return (
    <DataGridContainer>
      <DataGridContainer.Table
        initialState={{
          columns: {
            columnVisibilityModel: {
              vatRate: false,
              vatCustomerCode: false,
              costCenter: false,
              project: false,
              counterpartyCustomerCode: false,
              counterpartyType: false
            }
          },
          pagination: undefined,
          sorting: {
            sortModel: [{ field: 'entryDate', sort: 'desc' }]
          }
        }}
        paginationMode="server"
        paginationModel={{ page: pagination.page, pageSize: pagination.rowsPerPage }}
        rowCount={rowCount}
        columns={columns}
        onPaginationModelChange={(model) => {
          const { page, pageSize } = model

          onPagination(page, pageSize)
        }}
        rows={rows}
        isLoading={isLoading}
        hasFiltersSelected
      />
    </DataGridContainer>
  )
}
