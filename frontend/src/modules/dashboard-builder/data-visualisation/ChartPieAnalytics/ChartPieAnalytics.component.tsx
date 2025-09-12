import { ChartPieDashboards } from 'libs/data-visualisation-kit/components/ChartPieDashboards/ChartPieDashboards.component.tsx'
import { chartColors } from 'libs/ui-kit/theme/colors.ts'
import { formatNumberPercentage } from 'libs/utils/format.ts'
import { useChartPie } from 'modules/dashboard-builder/hooks/useChartPie.ts'

interface Data<T = unknown> {
  id: T
  label: string
  value: number
}

export interface ChartPieAnalyticsProps<T = unknown> {
  data: Data<T>[]
}

const CHART_COLORS = [...Object.values(chartColors).map((color) => color[600]), ...Object.values(chartColors).map((color) => color[800])]

export const ChartPieAnalytics = <T extends string>({ data }: ChartPieAnalyticsProps<T>) => {
  const transformedData = useChartPie<T>(data)

  return <ChartPieDashboards colors={CHART_COLORS} series={[{ data: transformedData, valueFormatter: ({ value }) => formatNumberPercentage(value / 100) }]} />
}
