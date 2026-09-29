import Box from '@mui/material/Box'
import { GridColDef } from '@mui/x-data-grid'

import { EventAllocationView } from 'libs/api-connectors/backend-connector-reeve/api/events/publicEventsApi.types'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { TruncatedCellText } from 'libs/ui-kit/components/CellText/TruncatedCellText.component.tsx'
import { DataGridContainer } from 'libs/ui-kit/components/DataGrid/DataGridContainer.component.tsx'
import { formatNumber } from 'libs/utils/format.ts'

interface EventAllocationBreakdownProps {
  allocations: EventAllocationView[]
}

interface AllocationRow {
  id: string
  projectTitle: string
  subProjectTitle: string | null
  milestoneTitle: string
  amountRcy: number | null
}

const renderAmountCell = ({ value }: { value?: number | null }) => <TruncatedCellText value={value || value === 0 ? formatNumber(value) : '-'} />

export const EventAllocationBreakdown = ({ allocations }: EventAllocationBreakdownProps) => {
  const { t } = useTranslations()

  const rows: AllocationRow[] = allocations.flatMap((allocation) =>
    allocation.milestones.map((milestone) => ({
      id: `${allocation.projectId}-${milestone.milestoneId}`,
      projectTitle: allocation.projectTitle,
      subProjectTitle: allocation.subProjectTitle,
      milestoneTitle: milestone.milestoneTitle,
      amountRcy: milestone.allocatedAmount
    }))
  )

  const columns: GridColDef<AllocationRow>[] = [
    {
      field: 'projectTitle',
      headerName: t({ id: 'auditProjectTitle' }),
      hideable: false,
      sortable: false,
      flex: 1,
      minWidth: 192,
      renderCell: ({ value }) => <TruncatedCellText value={value} />
    },
    {
      field: 'subProjectTitle',
      headerName: t({ id: 'auditSubprojectTitle' }),
      hideable: false,
      sortable: false,
      flex: 1,
      minWidth: 192,
      renderCell: ({ value }) => <TruncatedCellText value={value ?? '-'} />
    },
    {
      field: 'milestoneTitle',
      headerName: t({ id: 'auditMilestoneTitle' }),
      hideable: false,
      sortable: false,
      flex: 1,
      minWidth: 192,
      renderCell: ({ value }) => <TruncatedCellText value={value} />
    },
    {
      field: 'amountRcy',
      headerName: t({ id: 'amountRcy' }),
      align: 'right',
      headerAlign: 'right',
      hideable: false,
      sortable: false,
      flex: 1,
      minWidth: 192,
      renderCell: renderAmountCell
    }
  ]

  return (
    <Box px={3} pt={1} pb={3}>
      <DataGridContainer>
        <DataGridContainer.Table
          columns={columns}
          rows={rows}
          getRowId={(row) => row.id}
          noRowsMessage={t({ id: 'nothingHereMessage' })}
          paginationModel={{ page: 0, pageSize: rows.length || 1 }}
          onPaginationModelChange={() => {}}
          pageSizeOptions={undefined}
          isLoading={false}
          disableColumnMenu
          hideFooter
          hideFooterPagination
        />
      </DataGridContainer>
    </Box>
  )
}