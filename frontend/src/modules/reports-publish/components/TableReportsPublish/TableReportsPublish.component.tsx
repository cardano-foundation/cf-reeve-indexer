import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import { GridColDef } from '@mui/x-data-grid'
import dayjs from 'dayjs'

import { PublishReportRequest, ReportApiResponse } from 'libs/api-connectors/backend-connector-lob/api/reports/reportsApi.types.ts'
import { hasPermission } from 'libs/permissions/has-permission'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonSecondary } from 'libs/ui-kit/components/ButtonSecondary/ButtonSecondary.component.tsx'
import { DataGridContainer } from 'libs/ui-kit/components/DataGrid/DataGridContainer.component.tsx'
import { ModalAction } from 'libs/ui-kit/components/ModalAction/ModalAction.component.tsx'
import { formatCurrency } from 'modules/organizationDetails/components/organization-form/Organization.utils.ts'
import { getReportPeriod } from 'modules/report-parameters/utils/payload.ts'

interface TableReportsPublishProps {
  data: ReportApiResponse[]
  onPublishReport: (payload: Pick<PublishReportRequest, 'reportId'>) => Promise<void>
  onViewOpen: (report: ReportApiResponse) => void
  isFetching: boolean
}

export const TableReportsPublish = ({ data, onPublishReport, onViewOpen, isFetching }: TableReportsPublishProps) => {
  const { t } = useTranslations()

  const theme = useTheme()

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
          <ModalAction
            aria-label={t({ id: 'modalActionPublishReportTitle' })}
            message={t({ id: 'modalActionPublishReportMessage' })}
            primaryActionLabel={t({ id: 'confirm' })}
            secondaryActionLabel={t({ id: 'cancel' })}
            primaryActionOnClick={() => onPublishReport({ reportId: row.reportId })}
            renderButton={({ handleClickOpen, isModalDisabled }) => (
              <ButtonSecondary
                color="secondary"
                size="small"
                sx={{ color: theme.palette.secondary.dark, borderColor: theme.palette.secondary.main, '&:hover': { borderColor: theme.palette.secondary.dark } }}
                onClick={handleClickOpen}
                disabled={isModalDisabled || !hasPermission('reports', 'publish')}
              >
                {t({ id: 'publish' })}
              </ButtonSecondary>
            )}
          />
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
