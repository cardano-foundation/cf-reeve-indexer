import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import { useState } from 'react'
import { useMediaQuery, useTheme } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { getOrgPath } from 'routes'

import { ProjectAuditView } from 'libs/api-connectors/backend-connector-reeve/api/events/publicEventsApi.types'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import Link from '@mui/material/Link'
import { ProjectCard } from 'modules/public-events-auditor/components/ProjectCard/ProjectCard.component.tsx'
import { Chip } from 'libs/ui-kit/components/Chip/Chip.component.tsx'

interface ProjectCardsGridProps {
  projects: ProjectAuditView[]
  selectedKey: string | null
  onSelectKey: (key: string | null) => void
  organisationId: string
}

export const projectKey = (project: ProjectAuditView, index: number) => project.projectKey ?? project.projectId ?? `project-${index}`

export const ProjectCardsGrid = ({ projects, selectedKey, onSelectKey, organisationId }: ProjectCardsGridProps) => {
  const { t } = useTranslations()
  const theme = useTheme()
  const navigate = useNavigate()
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSelect = (key: string) => {
    onSelectKey(selectedKey === key ? null : key)
  }

  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))
  const previewCount = isDesktop ? 3 : 2

  const keyedProjects = projects.map((project, index) => ({ project, key: projectKey(project, index) }))

  const selectedIndex = keyedProjects.findIndex((entry) => entry.key === selectedKey)
  const isSelectedHidden = !isExpanded && selectedIndex >= previewCount

  const hasMore = projects.length > previewCount
  const visibleEntries = isExpanded ? keyedProjects : keyedProjects.slice(0, previewCount)

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Box sx={isExpanded ? { maxHeight: '28rem', overflowY: 'auto' } : undefined}>
        <Grid container spacing={2}>
          {visibleEntries.map(({ project, key }) => (
            <Grid key={key} size={{ xs: 12, smw: 6, lg: 4 }}>
              <ProjectCard
                project={project}
                currency={project.currency}
                isSelected={selectedKey === key}
                onClick={() => handleSelect(key)}
                onViewEvents={() => navigate(`${getOrgPath('projects/events', organisationId)}?projectId=${project.projectId}`)}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {hasMore && (
        <Box display="flex" alignItems="center" gap={1}>
          <Link component="button" sx={{ color: '#408AD8', fontWeight: 600 }} type="button" underline="hover" onClick={() => setIsExpanded((prev) => !prev)}>
            {isExpanded ? t({ id: 'auditShowLess' }) : t({ id: 'auditMoreProjects' }, { count: projects.length - previewCount })}
          </Link>
          {isSelectedHidden && <Chip color="info" label={t({ id: 'auditProjectSelected' })} />}
        </Box>
      )}
    </Box>
  )
}
