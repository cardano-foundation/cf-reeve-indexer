import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { BarChart } from '@mui/x-charts/BarChart'
import { useMemo } from 'react'

import { FundingOverview } from 'libs/api-connectors/backend-connector-reeve/api/overview/overviewApi.types.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { formatAuditAmount } from 'modules/public-events-auditor/utils/format.ts'
import { ChartEmpty } from 'modules/public-landing/components/ChartEmpty.component.tsx'
import { FUNDING_COLORS, formatCompactAmount, formatMonth, lastMonths } from 'modules/public-landing/utils/dashboard.ts'

type FlowKey = keyof typeof FUNDING_COLORS

export const FundingFlow = ({ funding }: { funding: FundingOverview }) => {
  const { t } = useTranslations()
  const theme = useTheme()

  const currency = funding.primaryCurrency
  const totals = funding.totals.find((entry) => entry.currency === currency) ?? { funded: 0, spent: 0, refunded: 0 }
  const otherCurrencies = funding.totals.filter((entry) => entry.currency !== currency)

  const labels: Record<FlowKey, string> = {
    funded: t({ id: 'dashboardFunded' }),
    spent: t({ id: 'dashboardSpent' }),
    refunded: t({ id: 'dashboardRefunded' })
  }

  const remaining = totals.funded - totals.spent - totals.refunded
  const usedShare = totals.funded > 0 ? Math.min((totals.spent + totals.refunded) / totals.funded, 1) : 0

  const monthly = useMemo(
    () => lastMonths(funding.monthly, (month) => ({ month, funded: 0, spent: 0, refunded: 0 })).map((entry) => ({ ...entry, label: formatMonth(entry.month) })),
    [funding.monthly]
  )
  const hasMonthly = monthly.some((entry) => entry.funded || entry.spent || entry.refunded)

  const valueFormatter = (value: number | null) => formatAuditAmount(value, currency)

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Box display="grid" gridTemplateColumns={{ xs: '1fr 1fr', md: 'repeat(4, 1fr)' }} gap={2}>
        {(Object.keys(FUNDING_COLORS) as FlowKey[]).map((key) => (
          <Box key={key} display="flex" flexDirection="column" gap={0.5}>
            <Box display="flex" alignItems="center" gap={1}>
              <Box width={10} height={10} borderRadius="50%" bgcolor={FUNDING_COLORS[key]} />
              <Typography color="text.secondary" variant="body2">
                {labels[key]}
              </Typography>
            </Box>
            <Tooltip title={valueFormatter(totals[key])} placement="top-start">
              <Typography color="text.primary" fontSize="1.5rem" fontWeight={600} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatCompactAmount(totals[key])}
                <Typography component="span" color="text.secondary" variant="body2" ml={0.5}>
                  {currency}
                </Typography>
              </Typography>
            </Tooltip>
          </Box>
        ))}
        <Box display="flex" flexDirection="column" gap={0.5}>
          <Typography color="text.secondary" variant="body2">
            {t({ id: 'dashboardRemaining' })}
          </Typography>
          <Tooltip title={valueFormatter(remaining)} placement="top-start">
            <Typography color="text.primary" fontSize="1.5rem" fontWeight={600} sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatCompactAmount(remaining)}
              <Typography component="span" color="text.secondary" variant="body2" ml={0.5}>
                {currency}
              </Typography>
            </Typography>
          </Tooltip>
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap={1}>
        <Box display="flex" justifyContent="space-between">
          <Typography color="text.secondary" variant="caption">
            {t({ id: 'dashboardUtilisation' })}
          </Typography>
          <Typography color="text.primary" variant="caption" fontWeight={600}>
            {Math.round(usedShare * 100)}%
          </Typography>
        </Box>
        <Box display="flex" height={10} gap="2px" borderRadius={5} overflow="hidden" bgcolor={theme.palette.background.paper}>
          {totals.funded > 0 &&
            (['spent', 'refunded'] as const).map((key) =>
              totals[key] > 0 ? <Box key={key} height="100%" width={`${Math.min(totals[key] / totals.funded, 1) * 100}%`} bgcolor={FUNDING_COLORS[key]} /> : null
            )}
        </Box>
      </Box>

      {hasMonthly ? (
        <Box mx={-1}>
          <BarChart
            dataset={monthly}
            xAxis={[{ scaleType: 'band', dataKey: 'label', categoryGapRatio: 0.35, barGapRatio: 0.15 }]}
            yAxis={[{ valueFormatter: (value: number) => formatCompactAmount(value), width: 48, domainLimit: 'nice' }]}
            series={(Object.keys(FUNDING_COLORS) as FlowKey[]).map((key) => ({ dataKey: key, label: labels[key], color: FUNDING_COLORS[key], valueFormatter }))}
            grid={{ horizontal: true }}
            borderRadius={4}
            height={280}
            margin={{ left: 0, right: 8, top: 16, bottom: 0 }}
            slotProps={{ legend: { position: { vertical: 'top', horizontal: 'start' } } }}
          />
        </Box>
      ) : (
        <ChartEmpty message={t({ id: 'dashboardNoFundingYet' })} hint={t({ id: 'dashboardNoDataHint' })} height={280} />
      )}

      {otherCurrencies.length > 0 && (
        <Typography color="text.secondary" variant="caption">
          {t({ id: 'dashboardOtherCurrencies' }, { currency })} {otherCurrencies.map((entry) => `${formatCompactAmount(entry.funded)} ${entry.currency || '—'}`).join(' · ')}
        </Typography>
      )}
    </Box>
  )
}
