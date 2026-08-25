import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { SubProjectAuditView } from 'libs/api-connectors/backend-connector-reeve/api/events/publicEventsApi.types'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { TruncatedCellText } from 'libs/ui-kit/components/CellText/TruncatedCellText.component.tsx'
import { TableContainer } from 'libs/ui-kit/components/Table/Table.component.tsx'
import { createColumns } from 'libs/ui-kit/components/Table/Table.utils.ts'
import { formatAuditAmount } from 'modules/public-events-auditor/utils/format.ts'
import { ProjectBreakdownMilestones } from 'modules/public-events-auditor/components/ProjectBreakdownMilestones/ProjectBreakdownMilestones.component.tsx'
import { UtilisationBar } from '../UtilisationBar/UtilisationBar.component'

interface ProjectBreakdownSubProjectsProps {
    subProjects: SubProjectAuditView[]
}

export const ProjectBreakdownSubProjects = ({ subProjects }: ProjectBreakdownSubProjectsProps) => {
    const { t } = useTranslations()
    const theme = useTheme()

    const columns = createColumns<SubProjectAuditView>()([
        {
            field: 'subProjectTitle',
            headerName: t({ id: 'auditSubprojectTitle' }),
            align: 'left',
            headerAlign: 'left',
            sortable: true,
            width: '25%',
            renderCell: (row) => <TruncatedCellText value={row.subProjectTitle || row.subProjectId || t({ id: 'auditUnattributed' })} />
        },
        {
            field: 'allocatedAmount',
            headerName: t({ id: 'auditAllocated' }),
            align: 'right',
            headerAlign: 'right',
            sortable: true,
            width: '18%',
            renderCell: (row) => <TruncatedCellText value={formatAuditAmount(row.allocatedAmount)} />
        },
        {
            field: 'spentAmount',
            headerName: t({ id: 'auditSpent' }),
            align: 'right',
            headerAlign: 'right',
            sortable: true,
            width: '18%',
            renderCell: (row) => <TruncatedCellText value={formatAuditAmount(row.spentAmount)} />
        },
        {
            field: 'remaining',
            headerName: t({ id: 'auditRemaining' }),
            align: 'right',
            headerAlign: 'right',
            sortable: false,
            width: '18%',
            renderCell: (row) => <TruncatedCellText value={formatAuditAmount(row.allocatedAmount - row.spentAmount)} />
        },
        {
            field: 'utilisation',
            headerName: t({ id: 'auditUtilisation' }),
            align: 'left',
            headerAlign: 'left',
            sortable: false,
            width: '21%',
            renderCell: (row) => <UtilisationBar allocated={row.allocatedAmount} spent={row.spentAmount} />
        }
    ])

    return (
        <Box display="flex" flexDirection="column" gap={2} px={3} pt={1} pb={3}>
            <Typography color={theme.palette.text.secondary} variant="body2" sx={{ fontWeight: 600 }}>
                {t({ id: 'auditSubprojects' })}
            </Typography>
            <TableContainer>
                <TableContainer.Table
                    aria-label="project-breakdown-subprojects-table"
                    columns={columns}
                    noRowsMessage={t({ id: 'nothingHereMessage' })}
                    rows={subProjects}
                    getRowId={(row) => row.subProjectId ?? row.subProjectTitle ?? `subproject-${subProjects.indexOf(row)}`}
                    collapsableRow={(row) => (row.milestones.length > 0 ? <ProjectBreakdownMilestones milestones={row.milestones} /> : null)}
                    isLoading={false}
                    hidePagination
                    sx={{ minWidth: '70rem' }}
                />
            </TableContainer>
        </Box>
    )
}