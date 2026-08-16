import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import { useState } from 'react'
import { useMediaQuery, useTheme } from '@mui/material'

import { ProjectAuditView } from 'libs/api-connectors/backend-connector-reeve/api/events/publicEventsApi.types'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import Link from '@mui/material/Link'
import { ProjectCard } from 'modules/public-events-auditor/components/ProjectCard/ProjectCard.component.tsx'

interface ProjectCardsGridProps {
  projects: ProjectAuditView[]
}

const projectKey = (project: ProjectAuditView, index: number) => project.projectKey ?? project.projectId ?? `project-${index}`

export const ProjectCardsGrid = ({ projects }: ProjectCardsGridProps) => {
  const { t } = useTranslations()
  const theme = useTheme()
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSelect = (key: string) => {
    setSelectedKey((current) => (current === key ? null : key))
  }

  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))
  const previewCount = isDesktop ? 3 : 2

  const keyedProjects = projects.map((project, index) => ({ project, key: projectKey(project, index) }))

  const hasMore = projects.length > previewCount

  const visibleEntries = (() => {
    if (isExpanded) return keyedProjects

    const selectedIndex = keyedProjects.findIndex((entry) => entry.key === selectedKey)

    if (selectedIndex === -1 || selectedIndex < previewCount) {
      return keyedProjects.slice(0, previewCount)
    }

    const selectedEntry = keyedProjects[selectedIndex]
    const rest = keyedProjects.filter((_, index) => index !== selectedIndex)
    return [selectedEntry, ...rest.slice(0, previewCount - 1)]
  })()


  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Box sx={isExpanded ? { maxHeight: '28rem', overflowY: 'auto' } : undefined}>
        <Grid container spacing={2}>
          {visibleEntries.map(({ project, key }) => (
            <Grid key={key} size={{ xs: 12, smw: 6, lg: 4 }}>
              <ProjectCard project={project} currency={project.currency} isSelected={selectedKey === key} onClick={() => handleSelect(key)} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {hasMore && (
        <Box display="flex" justifyContent="flex-start">
          <Link component="button" sx={{ color: '#408AD8', fontWeight: 600 }} type="button" underline="hover" onClick={() => setIsExpanded((prev) => !prev)}>
            {isExpanded ? t({ id: 'auditShowLess' }) : t({ id: 'auditMoreProjects' }, { count: projects.length - previewCount })}
          </Link>
        </Box>
      )}
    </Box>
  )
}
