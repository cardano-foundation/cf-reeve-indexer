import Box from '@mui/material/Box'
import { BarChart } from '@mui/x-charts/BarChart'
import { useMemo } from 'react'

import { MonthCount } from 'libs/api-connectors/backend-connector-reeve/api/overview/overviewApi.types.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ChartEmpty } from 'modules/public-landing/components/ChartEmpty.component.tsx'
import { ACTIVITY_COLOR, formatCount, formatMonth, lastMonths } from 'modules/public-landing/utils/dashboard.ts'

export const TransactionActivity = ({ monthly }: { monthly: MonthCount[] }) => {
  const { t } = useTranslations()

  const dataset = useMemo(() => lastMonths(monthly, (month) => ({ month, count: 0 })).map((entry) => ({ ...entry, label: formatMonth(entry.month) })), [monthly])

  if (!dataset.some((entry) => entry.count > 0)) {
    return <ChartEmpty message={t({ id: 'dashboardNoTransactionsYet' })} hint={t({ id: 'dashboardNoDataHint' })} height={220} />
  }

  return (
    <Box mx={-1}>
      <BarChart
        dataset={dataset}
        xAxis={[{ scaleType: 'band', dataKey: 'label', categoryGapRatio: 0.35 }]}
        yAxis={[{ valueFormatter: (value: number) => formatCount(value), width: 40, domainLimit: 'nice' }]}
        series={[{ dataKey: 'count', label: t({ id: 'dashboardTransactions' }), color: ACTIVITY_COLOR, valueFormatter: (value) => formatCount(value) }]}
        grid={{ horizontal: true }}
        borderRadius={4}
        hideLegend
        height={220}
        margin={{ left: 0, right: 8, top: 16, bottom: 0 }}
      />
    </Box>
  )
}
