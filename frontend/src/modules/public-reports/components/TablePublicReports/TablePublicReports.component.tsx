import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { GridColDef } from '@mui/x-data-grid'
import { ExportSquare } from 'iconsax-react'

import { ReportApiResponse } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonSecondary } from 'libs/ui-kit/components/ButtonSecondary/ButtonSecondary.component.tsx'
import { CellText } from 'libs/ui-kit/components/CellText/CellText.component.tsx'
import { DataGridContainer } from 'libs/ui-kit/components/DataGrid/DataGridContainer.component.tsx'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { formatCurrency } from 'modules/public-reports/utils/format.ts'
import { getReportPeriod } from 'modules/public-reports/utils/payload.ts'
import { Filters } from 'modules/public-reports/components/Filters/Filters.component.tsx'
import { IdentityVerificationStatus } from 'modules/public-reports/components/IdentityVerificationStatus/IdentityVerificationStatus.component.tsx'

interface TableReportsPublicProps {
  data: ReportApiResponse[] | null
  onViewOpen: (report: ReportApiResponse) => void
  areFiltersSelected: boolean
  isFetching: boolean
}

export const TableReportsPublic = ({ data, onViewOpen, areFiltersSelected, isFetching }: TableReportsPublicProps) => {
  const { t } = useTranslations()

  const theme = useTheme()

  const columns: GridColDef[] = [
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
      field: 'currency',
      headerName: t({ id: 'currency' }),
      valueFormatter: (value) => formatCurrency(value),
      hideable: false,
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
      hideable: false,
      sortable: true,
      flex: 1,
      minWidth: 192
    },
    {
      field: 'identityVerified',
      headerName: t({ id: 'identityVerified' }),
      renderCell: ({ row }) => (
        <IdentityVerificationStatus isVerified={row.identityVerified} lei={row.lei} />
      ),
      hideable: false,
      sortable: true,
      flex: 1,
      minWidth: 50
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
      width: 96
    }
  ]

  return (
    <DataGridContainer>
      <DataGridContainer.Header>
        <Filters areFiltersSelected={areFiltersSelected} />
      </DataGridContainer.Header>
      <DataGridContainer.Table
        initialState={{
          sorting: {
            sortModel: [{ field: 'period', sort: 'desc' }]
          }
        }}
        columns={columns}
        rows={data ?? []}
        getRowId={(row) => `${row.organisationId}-${row.type}-${row.intervalType}-${row.year}-${row.period}-${row.ver}`}
        hasFiltersSelected={areFiltersSelected}
        isLoading={isFetching}
        disableColumnMenu
      />
    </DataGridContainer>
  )
}
