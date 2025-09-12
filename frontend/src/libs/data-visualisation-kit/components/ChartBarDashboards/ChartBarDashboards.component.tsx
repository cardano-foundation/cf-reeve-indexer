import { ChartDataProvider, ChartsXAxis, ChartsYAxis, ChartsGrid, type BarChartProps as BarChartPropsMUI } from '@mui/x-charts'

import { BarPlot } from 'libs/data-visualisation-kit/components/BarPlot/BarPlot.component.tsx'
import { ChartsLegends } from 'libs/data-visualisation-kit/components/ChartsLegend/ChartsLegend.component.tsx'
import { ChartsSurface } from 'libs/data-visualisation-kit/components/ChartsSurface/ChartsSurface.component.tsx'
import { ChartsTooltip } from 'libs/data-visualisation-kit/components/ChartsTooltip/ChartsTooltip.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { EmptyStateTable } from 'libs/ui-kit/components/EmptyStateTable/EmptyStateTable.component.tsx'

interface ChartBarDashboardsProps extends BarChartPropsMUI {
  isLegendHidden?: boolean
}

export const ChartBarDashboards = ({ colors, dataset, grid, layout, margin, series, title, slotProps, xAxis, yAxis, isLegendHidden }: ChartBarDashboardsProps) => {
  const { t } = useTranslations()

  const hasDataset = dataset?.some((data) => data && Object.values(data).some((value) => value && (value !== null || value !== undefined)))
  const hasSeries = series.some((serie) => serie.data && serie.data.length > 0 && serie.data.some((value) => value && value > 0))
  const hasData = hasDataset || hasSeries

  if (!hasData) {
    return <EmptyStateTable hint={t({ id: 'noReportingDataHint' })} message={t({ id: 'nothingHereMessage' })} />
  }

  return (
    <ChartDataProvider
      colors={colors}
      dataset={dataset}
      margin={margin}
      series={series.map((serie) => ({ ...serie, labelMarkType: 'circle', layout, type: 'bar' }))}
      title={title}
      xAxis={xAxis}
      yAxis={yAxis}
    >
      <ChartsSurface>
        <ChartsGrid {...grid} />
        <BarPlot borderRadius={8} />
        <ChartsXAxis />
        <ChartsYAxis />
      </ChartsSurface>
      <ChartsTooltip {...(slotProps && slotProps.tooltip)} />
      {!isLegendHidden && <ChartsLegends />}
    </ChartDataProvider>
  )
}
