import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { ArrowRotateLeft, MoneyRecive, MoneySend, Wallet3 } from 'iconsax-react'
import { ElementType, ReactNode } from 'react'

import { AuditSummaryView } from 'libs/api-connectors/backend-connector-reeve/api/events/publicEventsApi.types'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { colors } from 'libs/ui-kit/theme/colors.ts'
import { formatAuditAmount, formatAuditDate } from 'modules/public-events-auditor/utils/format.ts'

interface AuditKpiHeaderProps {
  audit: AuditSummaryView
}

interface StatTileProps {
  accent: string
  icon: ElementType
  label: string
  value: string
  caption?: ReactNode
}

const StatTile = ({ accent, icon: Icon, label, value, caption }: StatTileProps) => {
  const theme = useTheme()

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={1.5}
      height="100%"
      p={2.5}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        borderLeft: `4px solid ${accent}`,
        backgroundColor: theme.palette.background.paper
      }}>
      <Box alignItems="center" display="flex" gap={1.5}>
        <Box
          alignItems="center"
          display="flex"
          justifyContent="center"
          sx={{ backgroundColor: `${accent}1A`, borderRadius: '50%', height: 36, width: 36, flexShrink: 0 }}>
          <Icon color={accent} size={20} variant="Bold" />
        </Box>
        <Typography color={theme.palette.text.secondary} variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </Typography>
      </Box>
      <Typography color={theme.palette.text.primary} variant="h2" sx={{ wordBreak: 'break-word', lineHeight: 1.1 }}>
        {value}
      </Typography>
      {caption && (
        <Typography color={theme.palette.text.secondary} variant="caption">
          {caption}
        </Typography>
      )}
    </Box>
  )
}

export const AuditKpiHeader = ({ audit }: AuditKpiHeaderProps) => {
  const { t } = useTranslations()
  const theme = useTheme()

  const { currency } = audit

  const remainingAccent = audit.netRemaining < 0 ? colors.red[500] : colors.green[600]

  const dateRange =
    audit.firstEventDate || audit.lastEventDate
      ? `${formatAuditDate(audit.firstEventDate)} – ${formatAuditDate(audit.lastEventDate)}`
      : t({ id: 'auditNoDatedEvents' })

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Box alignItems="baseline" display="flex" flexWrap="wrap" gap={1} justifyContent="space-between">
        <Typography color={theme.palette.text.primary} variant="h3">
          {audit.organisationName ?? audit.organisationId}
        </Typography>
        <Typography color={theme.palette.text.secondary} variant="body2">
          {t({ id: 'auditReportingPeriod' })}: {dateRange}
        </Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatTile
            accent={colors.blue[600]}
            icon={MoneyRecive}
            label={t({ id: 'auditTotalFunded' })}
            value={formatAuditAmount(audit.totalFunded, currency)}
            caption={t({ id: 'auditFundingEventsCount' }, { count: audit.fundingCount })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatTile
            accent={colors.orange[500]}
            icon={MoneySend}
            label={t({ id: 'auditTotalSpent' })}
            value={formatAuditAmount(audit.totalSpent, currency)}
            caption={t({ id: 'auditSpendingEventsCount' }, { count: audit.spendingCount })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatTile
            accent={colors.red[400]}
            icon={ArrowRotateLeft}
            label={t({ id: 'auditTotalRefunded' })}
            value={formatAuditAmount(audit.totalRefunded, currency)}
            caption={t({ id: 'auditRefundEventsCount' }, { count: audit.refundCount })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatTile
            accent={remainingAccent}
            icon={Wallet3}
            label={t({ id: 'auditRemaining' })}
            value={formatAuditAmount(audit.netRemaining, currency)}
            caption={t({ id: 'auditRemainingHint' })}
          />
        </Grid>
      </Grid>
    </Box>
  )
}
