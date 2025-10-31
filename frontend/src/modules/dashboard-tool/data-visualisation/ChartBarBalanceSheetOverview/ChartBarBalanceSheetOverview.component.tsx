import { useMediaQuery, useTheme } from '@mui/material'
import { DatasetElementType } from '@mui/x-charts/internals'

import { ChartBarDashboards } from 'libs/data-visualisation-kit/components/ChartBarDashboards/ChartBarDashboards.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { cfChartColors } from 'libs/ui-kit/theme/colors.ts'
import { formatNumber, formatNumberCurrency } from 'libs/utils/format.ts'

interface Data extends DatasetElementType<number | string> {
  currentAssets: number
  nonCurrentAssets: number
  currentLiabilities: number
  nonCurrentLiabilities: number
  capital: number
}

interface ChartBarBalanceSheetOverviewProps {
  data: Data[]
}

const CHART_COLORS = Object.values(cfChartColors.blueCorporate);

export const ChartBarBalanceSheetOverview = ({ data }: ChartBarBalanceSheetOverviewProps) => {
  const { t } = useTranslations()

  const theme = useTheme()

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <ChartBarDashboards
      colors={CHART_COLORS}
      dataset={data}
      grid={{ horizontal: false, vertical: false }}
      layout={isMobile ? 'vertical' : 'horizontal'}
      margin={{ top: 20, right: 20, bottom: 10, left: 0 }}
      series={[
        {
          dataKey: 'currentAssets',
          label: t({ id: 'CURRENT' }),
          stack: 'total',
          valueFormatter: (value: number | null) =>
            value !== null ? formatNumberCurrency(value, { minimumFractionDigits: 0, maximumFractionDigits: 2, notation: 'compact' }) : null
        },
        {
          dataKey: 'nonCurrentAssets',
          label: t({ id: 'NON_CURRENT' }),
          stack: 'total',
          valueFormatter: (value: number | null) =>
            value !== null ? formatNumberCurrency(value, { minimumFractionDigits: 0, maximumFractionDigits: 2, notation: 'compact' }) : null
        },
        {
          dataKey: 'currentLiabilities',
          label: t({ id: 'CURRENT' }),
          stack: 'total',
          valueFormatter: (value: number | null) =>
            value !== null ? formatNumberCurrency(value, { minimumFractionDigits: 0, maximumFractionDigits: 2, notation: 'compact' }) : null
        },
        {
          dataKey: 'nonCurrentLiabilities',
          label: t({ id: 'NON_CURRENT' }),
          stack: 'total',
          valueFormatter: (value: number | null) =>
            value !== null ? formatNumberCurrency(value, { minimumFractionDigits: 0, maximumFractionDigits: 2, notation: 'compact' }) : null
        },
        {
          dataKey: 'capital',
          label: t({ id: 'CAPITAL' }),
          stack: 'total',
          valueFormatter: (value: number | null) =>
            value !== null ? formatNumberCurrency(value, { minimumFractionDigits: 0, maximumFractionDigits: 2, notation: 'compact' }) : null
        }
      ]}
      slotProps={{ tooltip: { trigger: 'axis' } }}
      xAxis={
        isMobile
          ? [
              {
                data: [t({ id: 'assetsChartLabel' }), t({ id: 'liabilitiesCapitalChartLabel' })],
                scaleType: 'band',
                height: 40,
                tickLabelPlacement: 'middle',
                tickLabelStyle: { textAnchor: 'middle' },
                categoryGapRatio: 0.5
              }
            ]
          : [{ valueFormatter: (value: number) => formatNumber(value, { minimumFractionDigits: 0, maximumFractionDigits: 1, notation: 'compact' }) }]
      }
      yAxis={
        isMobile
          ? [{ valueFormatter: (value: number) => formatNumber(value, { minimumFractionDigits: 0, maximumFractionDigits: 1, notation: 'compact' }) }]
          : [
              {
                data: [t({ id: 'assetsChartLabel' }), t({ id: 'liabilitiesCapitalChartLabel' })],
                scaleType: 'band',
                tickLabelPlacement: 'middle',
                categoryGapRatio: 0.5,
                width: 75
              }
            ]
      }
      isLegendHidden
    />
  )
}
