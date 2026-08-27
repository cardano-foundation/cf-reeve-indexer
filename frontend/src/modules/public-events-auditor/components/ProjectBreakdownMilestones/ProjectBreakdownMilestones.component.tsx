import { GridColDef } from '@mui/x-data-grid'
import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { MilestoneAuditView } from 'libs/api-connectors/backend-connector-reeve/api/events/publicEventsApi.types'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { TruncatedCellText } from 'libs/ui-kit/components/CellText/TruncatedCellText.component.tsx'
import { DataGridContainer } from 'libs/ui-kit/components/DataGrid/DataGridContainer.component.tsx'
import { AllocatedCell } from 'modules/public-events-auditor/components/AllocatedCell/AllocatedCell.component.tsx'
import { RemainingCell } from 'modules/public-events-auditor/components/RemainingCell/RemainingCell.component.tsx'
import { formatAuditAmount } from 'modules/public-events-auditor/utils/format.ts'

interface ProjectBreakdownMilestonesProps {
    milestones: MilestoneAuditView[]
}

export const ProjectBreakdownMilestones = ({ milestones }: ProjectBreakdownMilestonesProps) => {
    const { t } = useTranslations()
    const theme = useTheme()

    const columns: GridColDef<MilestoneAuditView>[] = [
        {
            field: 'milestoneTitle',
            headerName: t({ id: 'auditMilestoneTitle' }),
            hideable: false,
            sortable: true,
            flex: 1,
            minWidth: 160,
            renderCell: ({ row }) => <TruncatedCellText value={row.milestoneTitle || row.milestoneId || '-'} />
        },
        {
            field: 'allocatedAmount',
            headerName: t({ id: 'auditAllocated' }),
            align: 'right',
            headerAlign: 'right',
            hideable: false,
            sortable: true,
            flex: 1,
            minWidth: 140,
            renderCell: ({ row }) => <AllocatedCell allocated={row.allocatedAmount} refunded={row.refundedAmount} />
        },
        {
            field: 'spentAmount',
            headerName: t({ id: 'auditSpent' }),
            align: 'right',
            headerAlign: 'right',
            hideable: false,
            sortable: true,
            flex: 1,
            minWidth: 140,
            renderCell: ({ row }) => <TruncatedCellText value={formatAuditAmount(row.spentAmount)} />
        },
        {
            field: 'remaining',
            headerName: t({ id: 'auditRemaining' }),
            align: 'right',
            headerAlign: 'right',
            hideable: false,
            sortable: false,
            flex: 1,
            minWidth: 140,
            renderCell: ({ row }) => <RemainingCell allocated={row.allocatedAmount} spent={row.spentAmount} />
        }
    ]

    return (
        <Box display="flex" flexDirection="column" gap={2} px={3} pt={1} pb={3}>
            <Typography color={theme.palette.text.secondary} variant="body2" sx={{ fontWeight: 600 }}>
                {t({ id: 'auditMilestones' })}
            </Typography>
            <DataGridContainer>
                <DataGridContainer.Table
                    columns={columns}
                    rows={milestones}
                    getRowId={(row) => row.milestoneId ?? row.milestoneTitle ?? `milestone-${milestones.indexOf(row)}`}
                    noRowsMessage={t({ id: 'nothingHereMessage' })}
                    paginationModel={{ page: 0, pageSize: milestones.length || 1 }}
                    onPaginationModelChange={() => { }}
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