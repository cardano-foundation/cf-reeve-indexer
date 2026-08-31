import { ProjectAuditView } from 'libs/api-connectors/backend-connector-reeve/api/events/publicEventsApi.types'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { TruncatedCellText } from 'libs/ui-kit/components/CellText/TruncatedCellText.component.tsx'
import { TableContainer } from 'libs/ui-kit/components/Table/Table.component.tsx'
import { createColumns } from 'libs/ui-kit/components/Table/Table.utils.ts'
import { AllocatedCell } from 'modules/public-events-auditor/components/AllocatedCell/AllocatedCell.component.tsx'
import { ProjectBreakdownMilestones } from 'modules/public-events-auditor/components/ProjectBreakdownMilestones/ProjectBreakdownMilestones.component.tsx'
import { ProjectBreakdownSubProjects } from 'modules/public-events-auditor/components/ProjectBreakdownSubProjects/ProjectBreakdownSubProjects.component.tsx'
import { RemainingCell } from 'modules/public-events-auditor/components/RemainingCell/RemainingCell.component.tsx'
import { formatAuditAmount } from 'modules/public-events-auditor/utils/format.ts'
import { projectKey } from 'modules/public-events-auditor/utils/projectKey.ts'

import { UtilisationBar } from '../UtilisationBar/UtilisationBar.component'

interface ProjectBreakdownProjectsProps {
    projects: ProjectAuditView[]
    forceExpandedIds?: string[]
}

export const ProjectBreakdownProjects = ({ projects, forceExpandedIds }: ProjectBreakdownProjectsProps) => {
    const { t } = useTranslations()

    const rowKeys = new Map(projects.map((project, index) => [project, projectKey(project, index)]))

    const columns = createColumns<ProjectAuditView>()([
        {
            field: 'projectTitle',
            headerName: t({ id: 'auditProjectTitle' }),
            align: 'left',
            headerAlign: 'left',
            sortable: true,
            width: '17%',
            renderCell: (row) => <TruncatedCellText value={row.projectTitle || row.projectId || t({ id: 'auditUnattributed' })} />
        },
        {
            field: 'allocatedAmount',
            headerName: t({ id: 'auditAllocated' }),
            align: 'right',
            headerAlign: 'right',
            sortable: true,
            width: '17%',
            renderCell: (row) => <AllocatedCell allocated={row.allocatedAmount} refunded={row.refundedAmount} />
        },
        {
            field: 'spentAmount',
            headerName: t({ id: 'auditSpent' }),
            align: 'right',
            headerAlign: 'right',
            sortable: true,
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
            renderCell: (row) => <RemainingCell allocated={row.allocatedAmount} spent={row.spentAmount} />
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
            width: '22%',
            renderCell: (row) => <UtilisationBar allocated={row.allocatedAmount} spent={row.spentAmount} />
        }
    ])

    return (
        <TableContainer>
            <TableContainer.Table
                aria-label="project-breakdown-projects-table"
                columns={columns}
                rows={projects}
                getRowId={(row) => rowKeys.get(row)!}
                collapsableRow={(row) =>
                    row.subProjects.length > 0 ? (
                        <ProjectBreakdownSubProjects subProjects={row.subProjects} />
                    ) : row.milestones.length > 0 ? (
                        <ProjectBreakdownMilestones milestones={row.milestones} />
                    ) : null
                }
                noRowsMessage={t({ id: 'nothingHereMessage' })}
                forceExpandedIds={forceExpandedIds}
                isLoading={false}
                hidePagination
                sx={{ minWidth: '70rem' }}
            />
        </TableContainer>
    )
}
