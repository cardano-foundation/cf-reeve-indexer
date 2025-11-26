import { useMediaQuery, useTheme } from '@mui/material'
import { type DatasetElementType } from '@mui/x-charts/internals'

import { ChartBarDashboards } from 'libs/data-visualisation-kit/components/ChartBarDashboards/ChartBarDashboards.component.tsx'
import { cfChartColors } from 'libs/ui-kit/theme/colors.ts'
import { formatNumber, formatNumberCurrency } from 'libs/utils/format.ts'

interface Data extends DatasetElementType<number | string> {
  expense: number
  label: string
}

interface ChartBarTotalExpensesProps {
  data: Data[]
}

const CHART_COLORS = Object.values(cfChartColors.blueCorporate)

export const ChartBarTotalExpenses = ({ data }: ChartBarTotalExpensesProps) => {
  const theme = useTheme()

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <ChartBarDashboards
      colors={CHART_COLORS}
      dataset={data}
      grid={{ horizontal: true, vertical: false }}
      layout="vertical"
      margin={{ top: 20, right: 0, bottom: 10, left: 0 }}
      series={[
        {
          dataKey: 'expense',
          valueFormatter: (value: number | null) =>
            value !== null ? formatNumberCurrency(value, { minimumFractionDigits: 0, maximumFractionDigits: 2, notation: 'compact' }) : null
        }
      ]}
      slotProps={{ tooltip: { trigger: 'axis' } }}
      xAxis={[
        {
          dataKey: 'label',
          id: 'label',
          height: 55,
          scaleType: 'band',
          tickLabelInterval: (_, index) => (isMobile ? index % 2 === 0 : true),
          tickLabelPlacement: 'middle',
          categoryGapRatio: 0.425
        }
      ]}
      yAxis={[
        {
          valueFormatter: (value: number) => formatNumber(value, { minimumFractionDigits: 0, maximumFractionDigits: 1, notation: 'compact' }),
          disableLine: true,
          disableTicks: true
        }
      ]}
      isLegendHidden
    />
  )
}
