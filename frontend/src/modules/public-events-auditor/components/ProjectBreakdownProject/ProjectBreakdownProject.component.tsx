import { ProjectAuditView } from 'libs/api-connectors/backend-connector-reeve/api/events/publicEventsApi.types'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { TruncatedCellText } from 'libs/ui-kit/components/CellText/TruncatedCellText.component.tsx'
import { TableContainer } from 'libs/ui-kit/components/Table/Table.component.tsx'
import { createColumns } from 'libs/ui-kit/components/Table/Table.utils.ts'
import { formatAuditAmount } from 'modules/public-events-auditor/utils/format.ts'
import { ProjectBreakdownSubProjects } from 'modules/public-events-auditor/components/ProjectBreakdownSubProjects/ProjectBreakdownSubProjects.component.tsx'
import { ProjectBreakdownMilestones } from 'modules/public-events-auditor/components/ProjectBreakdownMilestones/ProjectBreakdownMilestones.component.tsx'
import { UtilisationBar } from '../UtilisationBar/UtilisationBar.component'

interface ProjectBreakdownProjectProps {
    project: ProjectAuditView
}

export const ProjectBreakdownProject = ({ project }: ProjectBreakdownProjectProps) => {
    const { t } = useTranslations()

    const columns = createColumns<ProjectAuditView>()([
        {
            field: 'projectTitle',
            headerName: t({ id: 'auditProjectTitle' }),
            align: 'left',
            headerAlign: 'left',
            sortable: false,
            width: '22%',
            renderCell: (row) => <TruncatedCellText value={row.projectTitle || row.projectId || t({ id: 'auditUnattributed' })} />
        },
        {
            field: 'allocatedAmount',
            headerName: t({ id: 'auditAllocated' }),
            align: 'right',
            headerAlign: 'right',
            sortable: false,
            width: '17%',
            renderCell: (row) => <TruncatedCellText value={formatAuditAmount(row.allocatedAmount)} />
        },
        {
            field: 'spentAmount',
            headerName: t({ id: 'auditSpent' }),
            align: 'right',
            headerAlign: 'right',
            sortable: false,
            width: '17%',
            renderCell: (row) => <TruncatedCellText value={formatAuditAmount(row.spentAmount)} />
        },
        {
            field: 'remaining',
            headerName: t({ id: 'auditRemaining' }),
            align: 'right',
            headerAlign: 'right',
            sortable: false,
            width: '17%',
            renderCell: (row) => <TruncatedCellText value={formatAuditAmount(row.remaining)} />
        },
        {
            field: 'currency',
            headerName: t({ id: 'currency' }),
            align: 'left',
            headerAlign: 'left',
            sortable: false,
            width: '10%',
            renderCell: (row) => <TruncatedCellText value={row.currency ?? '-'} />
        },
        {
            field: 'utilisation',
            headerName: t({ id: 'auditUtilisation' }),
            align: 'left',
            headerAlign: 'left',
            sortable: false,
            width: '17%',
            renderCell: (row) => <UtilisationBar allocated={row.allocatedAmount} spent={row.spentAmount} />
        }
    ])

    return (
        <TableContainer>
            <TableContainer.Table
                aria-label="project-breakdown-project-table"
                columns={columns}
                rows={[project]}
                getRowId={(row) => row.projectKey ?? row.projectId ?? 'project'}
                collapsableRow={(row) =>
                    row.subProjects.length > 0 ? (
                        <ProjectBreakdownSubProjects subProjects={row.subProjects} />
                    ) : row.milestones.length > 0 ? (
                        <ProjectBreakdownMilestones milestones={row.milestones} />
                    ) : null
                }
                alwaysExpanded
                isLoading={false}
                hidePagination
                sx={{ minWidth: '50rem' }}
            />
        </TableContainer>
    )
}