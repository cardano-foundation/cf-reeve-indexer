import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { GridColDef } from '@mui/x-data-grid'
import dayjs from 'dayjs'
import { CloseCircle, ExportSquare, TickCircle } from 'iconsax-react'

import { ExtractedTransactionsResponse } from 'libs/api-connectors/backend-connector-lob/api/extraction/extractionApi.types.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { CellCodeDetails } from 'libs/ui-kit/components/CellCodeDetails/CellCodeDetails.component.tsx'
import { DataGridContainer } from 'libs/ui-kit/components/DataGrid/DataGridContainer.component.tsx'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { colors as paletteColors } from 'libs/ui-kit/theme/colors.ts'
import { formatNumber, formatNumberPercentage } from 'libs/utils/format.ts'

interface ExtractedTransactionsProps {
  rows: ExtractedTransactionsResponse[]
  isLoading: boolean
}

export const ExtractedTransactions = ({ rows, isLoading }: ExtractedTransactionsProps) => {
  const { t } = useTranslations()

  const theme = useTheme()

  const columns: GridColDef<(typeof rows)[number]>[] = [
    {
      field: 'blockChainHash',
      headerName: t({ id: 'transactionHash' }),
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
      minWidth: 192
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
    { field: 'documentNum', headerName: t({ id: 'documentNumber' }), hideable: false, sortable: true, flex: 1, minWidth: 192 },
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
      hideable: true,
      sortable: true,
      flex: 1,
      minWidth: 192
    },
    {
      field: 'fxRate',
      headerName: t({ id: 'exchangeRate' }),
      valueFormatter: (value) => formatNumber(value, { minimumFractionDigits: 5, maximumFractionDigits: 5 }),
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
      hideable: false,
      sortable: true,
      flex: 1,
      minWidth: 192
    },
    {
      field: 'vatCustomerCode',
      headerName: t({ id: 'vatCode' }),
      hideable: false,
      sortable: true,
      flex: 1,
      minWidth: 192
    },
    {
      field: 'costCenterChild',
      headerName: t({ id: 'costCenterChild' }),
      valueGetter: (_, row) => row.costCenterCustomerCode,
      renderCell: ({ row }) => <CellCodeDetails code={row.costCenterCustomerCode} description={row.costCenterName} />,
      hideable: true,
      sortable: true,
      flex: 1,
      minWidth: 192
    },
    {
      field: 'costCenterParent',
      headerName: t({ id: 'costCenterParent' }),
      valueGetter: (_, row) => row.parentCostCenterCustomerCode,
      renderCell: ({ row }) => <CellCodeDetails code={row.parentCostCenterCustomerCode} description={row.parentCostCenterName} />,
      hideable: false,
      sortable: true,
      flex: 1,
      minWidth: 192
    },
    {
      field: 'projectChild',
      headerName: t({ id: 'projectCodeChild' }),
      valueGetter: (_, row) => row.projectCustomerCode,
      renderCell: ({ row }) => <CellCodeDetails code={row.projectCustomerCode} description={row.projectName} />,
      hideable: true,
      sortable: true,
      flex: 1,
      minWidth: 192
    },
    {
      field: 'projectParent',
      headerName: t({ id: 'projectCodeParent' }),
      valueGetter: (_, row) => row.parentProjectCustomerCode,
      renderCell: ({ row }) => <CellCodeDetails code={row.parentProjectCustomerCode} description={row.parentProjectName} />,
      hideable: false,
      sortable: true,
      flex: 1,
      minWidth: 192
    },
    {
      field: 'counterpartyCustomerCode',
      headerName: t({ id: 'counterpartyID' }),
      hideable: false,
      sortable: true,
      flex: 1,
      minWidth: 192
    },
    { field: 'counterpartyName', headerName: t({ id: 'counterpartyName' }), hideable: true, sortable: true, flex: 1, minWidth: 192 },
    { field: 'counterpartyType', headerName: t({ id: 'counterpartyType' }), hideable: false, sortable: true, flex: 1, minWidth: 192 },
    {
      field: 'accountDebit',
      headerName: t({ id: 'accountDebit' }),
      valueGetter: (_, row) => row.accountDebitCode,
      renderCell: ({ row }) => <CellCodeDetails code={row.accountDebitCode} description={row.accountDebitName} />,
      hideable: true,
      sortable: true,
      flex: 1,
      minWidth: 240
    },
    {
      field: 'accountCredit',
      headerName: t({ id: 'accountCredit' }),
      valueGetter: (_, row) => row.accountCreditCode,
      renderCell: ({ row }) => <CellCodeDetails code={row.accountCreditCode} description={row.accountCreditName} />,
      hideable: true,
      sortable: true,
      flex: 1,
      minWidth: 240
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
    },
    {
      field: 'reconciliation',
      headerName: 'Reconciled',
      renderCell: ({ value }) =>
        value === 'OK' ? <TickCircle color={paletteColors.green[600]} size={20} variant="Bold" /> : <CloseCircle color={paletteColors.red[600]} size={20} variant="Bold" />,
      hideable: true,
      sortable: true,
      flex: 1,
      minWidth: 192
    }
  ]

  return (
    <DataGridContainer>
      <DataGridContainer.Table
        initialState={{
          columns: {
            columnVisibilityModel: {
              amountLcy: false,
              costCenterChild: false,
              projectChild: false,
              counterpartyName: false,
              accountDebit: false,
              accountCredit: false
            }
          },
          sorting: {
            sortModel: [{ field: 'entryDate', sort: 'desc' }]
          }
        }}
        columns={columns}
        rows={rows}
        isLoading={isLoading}
        hasFiltersSelected
      />
    </DataGridContainer>
  )
}
