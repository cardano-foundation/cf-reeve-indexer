import Box from '@mui/material/Box'
import { GridColDef } from '@mui/x-data-grid'
import dayjs from 'dayjs'
import { Link as RouterLink } from 'react-router-dom'

import { useLocationState } from 'hooks'
import { ReportApiResponse } from 'libs/api-connectors/backend-connector-lob/api/reports/reportsApi.types.ts'
import { hasPermission } from 'libs/permissions/has-permission'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonSecondary } from 'libs/ui-kit/components/ButtonSecondary/ButtonSecondary.component.tsx'
import { DataGridContainer } from 'libs/ui-kit/components/DataGrid/DataGridContainer.component.tsx'
import { SelectOption } from 'libs/ui-kit/components/InputSelect/InputSelect.component.tsx'
import { formatCurrency } from 'modules/organizationDetails/components/organization-form/Organization.utils.ts'
import { getReportPeriod } from 'modules/report-parameters/utils/payload.ts'

interface TableReportsPendingProps {
  currencies: SelectOption[]
  data: ReportApiResponse[]
  onViewOpen: (report: ReportApiResponse) => void
  isFetching: boolean
}

export const TableReportsPending = ({ currencies, data, onViewOpen, isFetching }: TableReportsPendingProps) => {
  const { t } = useTranslations()

  const { pathname } = useLocationState()

  const columns: GridColDef<(typeof data)[number]>[] = [
    {
      field: 'type',
      headerName: t({ id: 'report' }),
      valueFormatter: (value) => t({ id: value }),
      hideable: false,
      sortable: true,
      flex: 1,
      minWidth: 192
    },
    {
      field: 'documentCurrencyCustomerCode',
      headerName: t({ id: 'currency' }),
      valueFormatter: (value) => formatCurrency(value),
      hideable: false,
      sortable: true,
      flex: 1,
      minWidth: 192
    },
    {
      field: 'createdBy',
      headerName: t({ id: 'createdBy' }),
      hideable: true,
      sortable: true,
      flex: 1,
      minWidth: 192
    },
    {
      field: 'createdAt',
      headerName: t({ id: 'createdOn' }),
      valueFormatter: (value) => dayjs(value).format('DD/MM/YYYY'),
      hideable: true,
      sortable: true,
      flex: 1,
      minWidth: 192
    },
    {
      field: 'ver',
      headerName: t({ id: 'version' }),
      hideable: true,
      sortable: true,
      flex: 1,
      minWidth: 192
    },
    {
      field: 'period',
      headerName: t({ id: 'period' }),
      valueGetter: (_, row) => {
        const { intervalType, period, year } = row

        return getReportPeriod(intervalType, period, year)
      },
      hideable: false,
      sortable: true,
      flex: 1,
      minWidth: 192
    },
    {
      field: 'actions',
      headerName: '',
      renderCell: ({ row }) => (
        <Box display="flex" gap={1} justifyContent="flex-end">
          <ButtonSecondary size="small" onClick={() => onViewOpen(row)}>
            {t({ id: 'view' })}
          </ButtonSecondary>
          <ButtonSecondary
            component={RouterLink}
            disabled={!hasPermission('reports', 'edit')}
            size="small"
            state={{
              currency: currencies.find(({ value }) => value === row.documentCurrencyCustomerCode),
              period: getReportPeriod(row.intervalType, row.period, row.year),
              redirect: pathname
            }}
            to={`/secure/reporting/report/${row.type.toLowerCase().replace('_', '-')}`}
          >
            {t({ id: 'edit' })}
          </ButtonSecondary>
        </Box>
      ),
      hideable: false,
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      width: 170
    }
  ]

  return (
    <DataGridContainer>
      <DataGridContainer.Table
        initialState={{
          columns: {
            columnVisibilityModel: {
              createdAt: false
            }
          },
          sorting: {
            sortModel: [{ field: 'createdAt', sort: 'desc' }]
          }
        }}
        columns={columns}
        noRowsHint={t({ id: 'noReportsWithStatusHint' })}
        noRowsMessage={t({ id: 'nothingHereMessage' })}
        rows={data ?? []}
        getRowId={(row) => row.reportId}
        isLoading={isFetching}
      />
    </DataGridContainer>
  )
}
