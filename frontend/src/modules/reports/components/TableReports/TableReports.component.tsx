import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { GridColDef } from '@mui/x-data-grid'
import dayjs from 'dayjs'
import { Add, ExportSquare } from 'iconsax-react'
import { Link as RouterLink } from 'react-router-dom'

import { ReportApiResponse } from 'libs/api-connectors/backend-connector-lob/api/reports/reportsApi.types.ts'
import { hasPermission } from 'libs/permissions/has-permission'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonPrimary } from 'libs/ui-kit/components/ButtonPrimary/ButtonPrimary.component.tsx'
import { ButtonSecondary } from 'libs/ui-kit/components/ButtonSecondary/ButtonSecondary.component.tsx'
import { CellText } from 'libs/ui-kit/components/CellText/CellText.component'
import { Chip } from 'libs/ui-kit/components/Chip/Chip.component.tsx'
import { DataGridContainer } from 'libs/ui-kit/components/DataGrid/DataGridContainer.component.tsx'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { formatCurrency } from 'modules/organizationDetails/components/organization-form/Organization.utils.ts'
import { getReportPeriod } from 'modules/report-parameters/utils/payload.ts'
import { PATHS } from 'routes'

interface TableReportsProps {
  data: ReportApiResponse[]
  onViewOpen: (report: ReportApiResponse) => void
  isFetching: boolean
}

export const TableReports = ({ data, onViewOpen, isFetching }: TableReportsProps) => {
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
      field: 'publishedBy',
      headerName: t({ id: 'publishedBy' }),
      hideable: true,
      sortable: true,
      flex: 1,
      minWidth: 192
    },
    {
      field: 'publishDate',
      headerName: t({ id: 'publishedOn' }),
      valueFormatter: (value) => (value ? dayjs(value).format('DD/MM/YYYY') : undefined),
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
      field: 'status',
      headerName: t({ id: 'status' }),
      valueGetter: (_, row) => {
        const isPublish = !row.publish && row.canBePublish
        const isPending = !row.publish && !row.canBePublish

        if (isPublish) {
          return t({ id: 'PUBLISH' })
        }

        if (isPending) {
          return t({ id: 'PENDING' })
        }

        return t({ id: 'PUBLISHED' })
      },
      renderCell: ({ row, value }) => {
        const isPublish = !row.publish && row.canBePublish
        const isPending = !row.publish && !row.canBePublish

        if (isPublish) {
          return <Chip color="success" label={value} size="small" />
        }

        if (isPending) {
          return <Chip color="warning" label={value} size="small" />
        }

        return <Chip color="secondary" label={value} size="small" />
      },
      sortComparator: (current, next) => (current > next ? 1 : current < next ? -1 : 0),
      hideable: false,
      sortable: true,
      flex: 1,
      minWidth: 192
    },
    {
      field: 'blockChainHash',
      headerName: t({ id: 'blockchainHash' }),
      renderCell: ({ value }) =>
        value ? (
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
        ) : (
          <CellText value={value} />
        ),
      hideable: true,
      sortable: true,
      flex: 1,
      minWidth: 192
    },
    {
      field: 'actions',
      headerName: '',
      renderCell: ({ row }) => (
        <ButtonSecondary size="small" onClick={() => onViewOpen(row)}>
          {t({ id: 'view' })}
        </ButtonSecondary>
      ),
      hideable: false,
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      width: 96
    }
  ]

  return (
    <DataGridContainer>
      <DataGridContainer.Table
        initialState={{
          columns: {
            columnVisibilityModel: {
              createdBy: false,
              createdAt: false,
              publishedBy: false,
              publishDate: false
            }
          },
          sorting: {
            sortModel: [{ field: 'createdAt', sort: 'desc' }]
          }
        }}
        columns={columns}
        noRowsAction={
          hasPermission('reports', 'create') ? (
            <ButtonPrimary component={RouterLink} startIcon={<Add size={20} variant="Bold" />} to={PATHS.REPORTING_REPORT_PARAMETERS}>
              {t({ id: 'createReport' })}
            </ButtonPrimary>
          ) : undefined
        }
        noRowsHint={t({ id: hasPermission('reports', 'create') ? 'createReportHint' : 'noReportsHint' })}
        noRowsMessage={t({ id: 'nothingHereMessage' })}
        rows={data ?? []}
        getRowId={(row) => row.reportId}
        isLoading={isFetching}
      />
    </DataGridContainer>
  )
}
