import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { GridColDef } from '@mui/x-data-grid'
import { ExportSquare } from 'iconsax-react'
import { useMemo, useRef } from 'react'

import { GetPublicReportsResponse200, ReportEntity } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types'
import { usePagination } from 'libs/hooks/usePagination'
import { useSorting } from 'libs/hooks/useSorting'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonSecondary } from 'libs/ui-kit/components/ButtonSecondary/ButtonSecondary.component.tsx'
import { CellText } from 'libs/ui-kit/components/CellText/CellText.component.tsx'
import { DataGridContainer } from 'libs/ui-kit/components/DataGrid/DataGridContainer.component.tsx'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { formatCurrency } from 'modules/public-reports/utils/format.ts'
import { getReportPeriod } from 'modules/public-reports/utils/payload.ts'
import { IdentityVerificationStatus } from 'modules/public-reports/components/IdentityVerificationStatus/IdentityVerificationStatus.component.tsx'
import { ReportsToolbar } from 'modules/public-reports/components/ReportsToolbar/ReportsToolbar.component'

interface TableReportsPublicProps {
  data: GetPublicReportsResponse200 | null
  pagination: ReturnType<typeof usePagination>
  sorting: ReturnType<typeof useSorting>
  onViewOpen: (report: ReportEntity) => void
  hasFiltersSelected: boolean
  isFetching: boolean
}

export const TableReportsPublic = ({ data, pagination, sorting, onViewOpen, hasFiltersSelected, isFetching }: TableReportsPublicProps) => {
  const { page, rowsPerPage, handlePagination } = pagination
  const { handleSorting } = sorting

  const { t } = useTranslations()

  const theme = useTheme()

  const rowCountRef = useRef(data?.total || 0)

  const rowCount = useMemo(() => {
    if (data?.total !== undefined) {
      rowCountRef.current = data.total
    }

    return rowCountRef.current
  }, [data?.total])

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
      renderCell: ({ row }) => <IdentityVerificationStatus isVerified={row.identityVerified} lei={row.lei} />,
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
      <DataGridContainer.Toolbar>
        <ReportsToolbar />
      </DataGridContainer.Toolbar>
      <DataGridContainer.Table
        initialState={{
          sorting: {
            sortModel: [{ field: 'period', sort: 'desc' }]
          }
        }}
        noRowsHint={t({ id: 'noPublicReportsHint' }, { organisation: 'Cardano Foundation' })}
        noRowsMessage={t({ id: 'nothingHereMessage' })}
        paginationModel={{ page, pageSize: rowsPerPage }}
        paginationMode="server"
        sortingMode="server"
        rowCount={rowCount}
        columns={columns}
        rows={data?.reports ?? []}
        getRowId={(row) => `${row.organisationId}-${row.type}-${row.intervalType}-${row.year}-${row.period}-${row.ver}`}
        onPaginationModelChange={(model) => {
          const { page, pageSize } = model

          handlePagination(page, pageSize)
        }}
        onSortModelChange={(model) => {
          const [current] = model

          handleSorting(current.field, current.sort)
        }}
        hasFiltersSelected={hasFiltersSelected}
        isLoading={isFetching}
        disableColumnMenu
      />
    </DataGridContainer>
  )
}
