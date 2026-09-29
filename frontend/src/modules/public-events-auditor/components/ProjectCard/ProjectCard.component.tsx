import { Box, CardActionArea, Divider, useTheme } from '@mui/material'
import Card from '@mui/material/Card'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { useEffect, useRef, useState } from 'react'

import { ProjectAuditView } from 'libs/api-connectors/backend-connector-reeve/api/events/publicEventsApi.types'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { colors } from 'libs/ui-kit/theme/colors.ts'
import { formatAuditAmount } from 'modules/public-events-auditor/utils/format.ts'

interface ProjectCardProps {
  project: ProjectAuditView
  currency: string | null
  isSelected?: boolean
  onClick?: () => void
  onViewEvents?: () => void
}

export const ProjectCard = ({ project, currency, isSelected, onClick, onViewEvents }: ProjectCardProps) => {
  const { t } = useTranslations()
  const theme = useTheme()
  const title = project.projectTitle || project.projectId || t({ id: 'auditUnattributed' })

  const titleRef = useRef<HTMLSpanElement>(null)
  const [isTitleTruncated, setIsTitleTruncated] = useState(false)

  useEffect(() => {
    const element = titleRef.current
    if (!element) return

    const checkTruncation = () => {
      setIsTitleTruncated(element.scrollWidth > element.clientWidth)
    }

    checkTruncation()

    const observer = new ResizeObserver(checkTruncation)
    observer.observe(element)

    return () => observer.disconnect()
  }, [title])

  return (
    <Card
      elevation={0}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        border: '1px solid',
        borderRadius: `${Number(theme.shape.borderRadius) * 2}px`,
        borderColor: isSelected ? 'info.main' : 'divider',
        backgroundColor: isSelected ? colors.blue[100] : theme.palette.common.white,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.1)'
      }}>
      <CardActionArea
        component="div"
        onClick={(event) => {
          if ((event.target as HTMLElement).closest('.MuiTooltip-popper')) return
          onClick?.()
        }}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'flex-start',
          gap: 1,
          p: 2,
          '&:hover .MuiCardActionArea-focusHighlight': {
            opacity: isSelected ? 0 : undefined
          }
        }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
          <Tooltip title={title} disableHoverListener={!isTitleTruncated}>
            <Typography
              ref={titleRef}
              variant="h6"
              sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, flex: '1 1 auto' }}>
              {title}
            </Typography>
          </Tooltip>
          <Typography variant="h6" sx={{ flexShrink: 0 }}>{currency}</Typography>
        </Box>
        <Divider sx={{ borderColor: isSelected ? 'info.main' : 'divider' }} />
        <Box display="flex" flexDirection="column">
          <Typography variant="body2" color="text.secondary">{t({ id: 'auditFunding' })}</Typography>
          <Typography variant="body1" fontWeight={600}>{formatAuditAmount(project.allocatedAmount, currency)}</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="flex-end">
          <Box display="flex" flexDirection="column">
            <Typography variant="body2" color="text.secondary">{t({ id: 'auditSpent' })}</Typography>
            <Typography variant="body1" fontWeight={600}>{formatAuditAmount(project.spentAmount, currency)}</Typography>
          </Box>
          <Link
            component="button"
            type="button"
            underline="hover"
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation()
              onViewEvents?.()
            }}
            sx={{ color: '#408AD8', fontWeight: 600 }}>
            {t({ id: 'auditViewEvents' })}
          </Link>
        </Box>
      </CardActionArea>
    </Card>
  )
}
