import {
  ChartDataProvider,
  ChartsGrid,
  ChartsXAxis,
  ChartsYAxis,
  LinePlot,
  MarkPlot,
  type LineChartProps as LineChartPropsMUI,
  type LineSeriesType,
} from '@mui/x-charts'

import { ChartsLegends } from 'libs/data-visualisation-kit/components/ChartsLegend/ChartsLegend.component'
import { ChartsSurface } from 'libs/data-visualisation-kit/components/ChartsSurface/ChartsSurface.component'
import { ChartsTooltip } from 'libs/data-visualisation-kit/components/ChartsTooltip/ChartsTooltip.component'
import { useTranslations } from 'libs/translations/hooks/useTranslations'
import { EmptyStateTable } from 'libs/ui-kit/components/EmptyStateTable/EmptyStateTable.component'

type ChartLineSeries = Pick<
  LineSeriesType,
  'id' | 'label' | 'data' | 'dataKey' | 'curve' | 'showMark' | 'connectNulls' | 'shape' | 'valueFormatter'
> & {
  markSize?: number
}

interface ChartLineDashboardsProps extends Omit<LineChartPropsMUI, 'series' | 'xAxis' | 'yAxis'> {
  series: ChartLineSeries[]
  xAxis: {
    data?: unknown[]
    dataKey?: string
    scaleType?: 'linear' | 'time' | 'log' | 'band'
    valueFormatter?: (value: any) => string
    min?: number | Date
    max?: number | Date
  }
  dataset?: Record<string, unknown>[]
  yAxis?: { min?: number; max?: number }[]
  isLegendHidden?: boolean
  showPoints?: boolean // new prop to control MarkPlot
  showLines?: boolean // new prop to control LinePlot
}

export const ChartLineDashboards = ({
  colors,
  dataset,
  height = 360,
  series,
  title,
  xAxis,
  yAxis,
  isLegendHidden,
  showPoints = false, // default false
  showLines = false, // default false - changed from true
}: ChartLineDashboardsProps) => {
  const { t } = useTranslations()

  const hasSeries = Boolean(
    series?.length &&
      (dataset?.length
        ? series.some((s) =>
            s.dataKey
              ? dataset.some((row) => {
                  const value = row?.[s.dataKey as keyof typeof row]
                  return typeof value === 'number' && Number.isFinite(value)
                })
              : (s.data ?? []).some((value) => typeof value === 'number' && Number.isFinite(value))
          )
        : series.some((s) => (s.data ?? []).some((value) => typeof value === 'number' && Number.isFinite(value))))
  )

  if (!hasSeries) {
    return <EmptyStateTable hint={t({ id: 'noReportingDataHint' })} message={t({ id: 'nothingHereMessage' })} />
  }

  return (
    <ChartDataProvider
      colors={colors}
      dataset={dataset}
      series={series.map((s) => ({ type: 'line', ...s }))}
      title={title}
      xAxis={[xAxis]}
      yAxis={yAxis}
      height={height}
    >
      <ChartsSurface>
        <ChartsGrid vertical={false} horizontal={false} />
        {showLines && <LinePlot />} {/* only render lines if showLines=true */}
        {showPoints && <MarkPlot />} {/* only render points if showPoints=true */}
        <ChartsXAxis />
        <ChartsYAxis />
      </ChartsSurface>
      <ChartsTooltip />
      {!isLegendHidden && <ChartsLegends />}
    </ChartDataProvider>
  )
}
