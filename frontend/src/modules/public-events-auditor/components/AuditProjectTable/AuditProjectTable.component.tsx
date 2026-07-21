import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import LinearProgress from '@mui/material/LinearProgress'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { ArrowDown2 } from 'iconsax-react'
import { Fragment, useState } from 'react'

import { AuditEventLineView, ProjectAuditView } from 'libs/api-connectors/backend-connector-reeve/api/events/publicEventsApi.types'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { colors } from 'libs/ui-kit/theme/colors.ts'
import { formatAuditAmount, formatAuditDate } from 'modules/public-events-auditor/utils/format.ts'

interface AuditProjectTableProps {
  projects: ProjectAuditView[]
  events: AuditEventLineView[]
  currency: string | null
  onSelectEvent: (txHash: string, eventId: string) => void
}

const isSpend = (event: AuditEventLineView) => (event.eventType ?? '').toUpperCase() === 'SPENDING'

const projectKey = (project: ProjectAuditView, index: number) => project.projectId ?? project.projectTitle ?? `project-${index}`

const utilisation = (project: ProjectAuditView) => {
  if (project.allocatedAmount > 0) return project.spentAmount / project.allocatedAmount
  return project.spentAmount > 0 ? 1 : 0
}

const RemainingCell = ({ value, currency }: { value: number; currency: string | null }) => {
  const theme = useTheme()
  const color = value < 0 ? colors.red[500] : theme.palette.text.primary

  return (
    <Typography color={color} component="span" variant="body2" sx={{ fontWeight: 600 }}>
      {formatAuditAmount(value, currency)}
    </Typography>
  )
}

export const AuditProjectTable = ({ projects, events, currency, onSelectEvent }: AuditProjectTableProps) => {
  const { t } = useTranslations()
  const theme = useTheme()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const toggle = (key: string) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))

  const spendsForProject = (project: ProjectAuditView) =>
    events.filter((event) => isSpend(event) && event.projectKey === project.projectKey)

  return (
    <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 720 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 40 }} />
            <TableCell>{t({ id: 'project' })}</TableCell>
            <TableCell sx={{ minWidth: 160 }}>{t({ id: 'auditUtilisation' })}</TableCell>
            <TableCell align="right">{t({ id: 'auditAllocated' })}</TableCell>
            <TableCell align="right">{t({ id: 'auditSpent' })}</TableCell>
            <TableCell align="right">{t({ id: 'auditRemaining' })}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {projects.map((project, index) => {
            const key = projectKey(project, index)
            const isExpanded = Boolean(expanded[key])
            const hasMilestones = project.milestones.length > 0
            const spends = spendsForProject(project)
            const hasSpends = spends.length > 0
            const expandable = hasMilestones || hasSpends
            const ratio = utilisation(project)
            const overspent = project.spentAmount > project.allocatedAmount
            const barValue = Math.min(ratio, 1) * 100

            return (
              <Fragment key={key}>
                <TableRow
                  hover={expandable}
                  onClick={() => expandable && toggle(key)}
                  sx={{ cursor: expandable ? 'pointer' : 'default', '& > *': { borderBottom: isExpanded ? 'unset' : undefined } }}>
                  <TableCell>
                    {expandable && (
                      <ArrowDown2
                        color={theme.palette.action.active}
                        size={16}
                        style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography color={theme.palette.text.primary} variant="body2" sx={{ fontWeight: 600 }}>
                      {project.projectTitle || project.projectId || t({ id: 'auditUnattributed' })}
                    </Typography>
                    {project.projectTitle && project.projectId && (
                      <Typography color={theme.palette.text.secondary} variant="caption">
                        {project.projectId}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" flexDirection="column" gap={0.5}>
                      <LinearProgress
                        value={barValue}
                        variant="determinate"
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: theme.palette.action.hover,
                          '& .MuiLinearProgress-bar': { backgroundColor: overspent ? colors.red[500] : colors.green[600] }
                        }}
                      />
                      <Typography color={overspent ? colors.red[500] : theme.palette.text.secondary} variant="caption">
                        {`${Math.round(ratio * 100)}%`}
                        {overspent ? ` · ${t({ id: 'auditOverspent' })}` : ''}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography component="span" variant="body2">
                      {formatAuditAmount(project.allocatedAmount, currency)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography component="span" variant="body2">
                      {formatAuditAmount(project.spentAmount, currency)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <RemainingCell currency={currency} value={project.remaining} />
                  </TableCell>
                </TableRow>
                {expandable && (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ py: 0, borderBottom: `1px solid ${theme.palette.divider}` }}>
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Box display="flex" flexDirection="column" gap={1.5} sx={{ backgroundColor: theme.palette.action.hover, borderRadius: 1, my: 1, px: 2, py: 1.5 }}>
                          {hasMilestones && (
                            <Box>
                              <Typography color={theme.palette.text.secondary} variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                {t({ id: 'auditMilestones' })}
                              </Typography>
                              <Table size="small" sx={{ mt: 0.5 }}>
                                <TableBody>
                                  {project.milestones.map((milestone, milestoneIndex) => (
                                <TableRow key={milestone.milestoneId ?? milestone.milestoneTitle ?? `milestone-${milestoneIndex}`}>
                                  <TableCell sx={{ border: 0, pl: 0 }}>
                                    <Typography color={theme.palette.text.primary} variant="body2">
                                      {milestone.milestoneTitle || milestone.milestoneId || '—'}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="right" sx={{ border: 0 }}>
                                    <Typography color={theme.palette.text.secondary} variant="caption">
                                      {t({ id: 'auditAllocated' })}
                                    </Typography>
                                    <Typography color={theme.palette.text.primary} variant="body2">
                                      {formatAuditAmount(milestone.allocatedAmount, currency)}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="right" sx={{ border: 0, pr: 0 }}>
                                    <Typography color={theme.palette.text.secondary} variant="caption">
                                      {t({ id: 'auditSpent' })}
                                    </Typography>
                                    <Typography color={theme.palette.text.primary} variant="body2">
                                      {formatAuditAmount(milestone.spentAmount, currency)}
                                    </Typography>
                                  </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </Box>
                          )}
                          {hasSpends && (
                            <Box>
                              <Typography color={theme.palette.text.secondary} variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                {t({ id: 'auditSpendingUnderProject' })}
                              </Typography>
                              <Table size="small" sx={{ mt: 0.5 }}>
                                <TableBody>
                                  {spends.map((spend, spendIndex) => (
                                    <TableRow
                                      key={spend.eventId ?? `${spend.txHash}-${spendIndex}`}
                                      hover
                                      onClick={() => spend.txHash && spend.eventId && onSelectEvent(spend.txHash, spend.eventId)}
                                      sx={{ cursor: spend.txHash && spend.eventId ? 'pointer' : 'default' }}>
                                      <TableCell sx={{ border: 0, pl: 0, minWidth: 100 }}>
                                        <Typography color={theme.palette.text.primary} variant="body2">
                                          {formatAuditDate(spend.date)}
                                        </Typography>
                                      </TableCell>
                                      <TableCell sx={{ border: 0 }}>
                                        <Typography color={theme.palette.text.primary} variant="body2">
                                          {spend.vendor || spend.spendingCategory || '—'}
                                        </Typography>
                                      </TableCell>
                                      <TableCell align="right" sx={{ border: 0, pr: 0 }}>
                                        <Typography color={theme.palette.text.primary} variant="body2" sx={{ fontWeight: 600 }}>
                                          {formatAuditAmount(spend.amount, currency)}
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </Box>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            )
          })}
        </TableBody>
      </Table>
    </Box>
  )
}
