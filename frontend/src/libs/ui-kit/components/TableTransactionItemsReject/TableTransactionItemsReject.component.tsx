import { SelectChangeEvent } from '@mui/material/Select'
import { GridColDef } from '@mui/x-data-grid'
import { Dispatch, SetStateAction, useState } from 'react'

import { TransactionItemApiResponse } from 'libs/api-connectors/backend-connector-lob/api/batches/batchesApi.types.ts'
import { TransactionItemsRejection } from 'libs/api-connectors/backend-connector-lob/api/transactions/transactionsApi.types.ts'
import { useGetTransactionsRejectionReasonsModel } from 'libs/models/transactions-model/GetTransactionsRejectionReasons/GetTransactionsRejectionReasons.service.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { CellCodeDetails } from 'libs/ui-kit/components/CellCodeDetails/CellCodeDetails.component.tsx'
import { DataGridContainer } from 'libs/ui-kit/components/DataGrid/DataGridContainer.component.tsx'
import { InputSelect, SelectOption } from 'libs/ui-kit/components/InputSelect/InputSelect.component.tsx'
import { colors as paletteColors } from 'libs/ui-kit/theme/colors.ts'
import { formatNumber, formatNumberPercentage } from 'libs/utils/format.ts'

interface ItemRejectionReasonProps {
  row: TransactionItemApiResponse
  onTransactionRejectionReasonsChange: Dispatch<SetStateAction<TransactionItemsRejection[]>>
}

const ItemRejectionReason = ({ row, onTransactionRejectionReasonsChange }: ItemRejectionReasonProps) => {
  const [rejectionReason, setRejectionReason] = useState<string>('')

  const { t } = useTranslations()

  const { transactionsRejectionReasons } = useGetTransactionsRejectionReasonsModel()

  const options: SelectOption[] = transactionsRejectionReasons
    ? (transactionsRejectionReasons.map((item) => ({
        name: t({ id: item }),
        value: item
      })) as SelectOption[])
    : []

  const handleChange = (event: SelectChangeEvent<unknown>) => {
    setRejectionReason(event.target.value as string)
    onTransactionRejectionReasonsChange((rejectionReasons) => [...rejectionReasons, { txItemId: row.id, rejectionCode: event.target.value } as TransactionItemsRejection])
  }

  return (
    <InputSelect
      id="select-rejection-reason"
      items={options}
      name="select-rejection-reason"
      label={t({ id: 'reasonForRejection' })}
      value={rejectionReason}
      onChange={handleChange}
      required
    />
  )
}

interface TableTransactionItemsRejectProps {
  data: TransactionItemApiResponse[] | null
  onTransactionRejectionReasonsChange: Dispatch<SetStateAction<TransactionItemsRejection[]>>
  isFetching: boolean
  isReview?: boolean
}

export const TableTransactionItemsReject = ({ data, onTransactionRejectionReasonsChange, isFetching, isReview }: TableTransactionItemsRejectProps) => {
  const { t } = useTranslations()

  const columns: GridColDef[] = [
    {
      field: 'documentNum',
      headerName: t({ id: 'documentNumber' }),
      hideable: false,
      sortable: true,
      flex: 1,
      minWidth: 192
    },
    {
      field: 'documentCurrencyCustomerCode',
      headerName: t({ id: 'currency' }),
      hideable: false,
      sortable: true,
      flex: 1,
      minWidth: 192
    },
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
    {
      field: 'counterpartyName',
      headerName: t({ id: 'counterpartyName' }),
      hideable: true,
      sortable: true,
      flex: 1,
      minWidth: 192
    },
    {
      field: 'counterpartyType',
      headerName: t({ id: 'counterpartyType' }),
      hideable: false,
      sortable: true,
      flex: 1,
      minWidth: 192
    },
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
      field: 'rejectionReasons',
      headerName: '',
      renderCell: ({ row }) => <ItemRejectionReason row={row} onTransactionRejectionReasonsChange={onTransactionRejectionReasonsChange} />,
      hideable: false,
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      width: 280
    }
  ]

  return (
    <DataGridContainer>
      <DataGridContainer.Table
        initialState={{
          columns: {
            columnVisibilityModel: {
              amountLcy: isReview ? true : false,
              costCenterChild: false,
              projectChild: false,
              counterpartyName: false,
              accountDebit: false,
              accountCredit: false
            }
          },
          pagination: {
            paginationModel: undefined
          }
        }}
        columns={columns}
        rows={data ?? []}
        noRowsMessage={t({ id: 'nothingHereMessage' })}
        pageSizeOptions={undefined}
        sx={{
          '&&': {
            maxHeight: '35.25rem',

            '& .MuiDataGrid-columnHeaders': {
              background: paletteColors.neutral[100]
            },
            '& .MuiDataGrid-columnHeader': {
              background: paletteColors.neutral[100]
            },
            '& .MuiDataGrid-cell': {
              background: paletteColors.neutral[50]
            }
          }
        }}
        isLoading={isFetching}
        hideFooter
        hideFooterPagination
      />
    </DataGridContainer>
  )
}
