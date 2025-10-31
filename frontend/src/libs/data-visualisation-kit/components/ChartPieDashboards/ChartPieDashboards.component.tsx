import { useTheme } from '@mui/material'
import { ChartDataProvider, PieChartProps as PieChartPropsMUI } from '@mui/x-charts'

import { ChartsLegends } from 'libs/data-visualisation-kit/components/ChartsLegend/ChartsLegend.component.tsx'
import { ChartsSurface } from 'libs/data-visualisation-kit/components/ChartsSurface/ChartsSurface.component.tsx'
import { ChartsTooltip } from 'libs/data-visualisation-kit/components/ChartsTooltip/ChartsTooltip.component.tsx'
import { PiePlot } from 'libs/data-visualisation-kit/components/PiePlot/PiePlot.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { EmptyStateTable } from 'libs/ui-kit/components/EmptyStateTable/EmptyStateTable.component.tsx'

interface ChartPieDashboardsProps extends Pick<PieChartPropsMUI, 'colors' | 'series' | 'title'> {}

export const ChartPieDashboards = ({ colors, series, title }: ChartPieDashboardsProps) => {
  const { t } = useTranslations()

  const theme = useTheme()

  const [serie] = series

  const hasData = serie && serie.data.length > 0 && serie.data.some((value) => value.value > 0)

  if (!hasData) {
    return <EmptyStateTable hint={t({ id: 'noReportingDataHint' })} message={t({ id: 'nothingHereMessage' })} />
  }

  return (
    <ChartDataProvider colors={colors} series={[{ ...serie, labelMarkType: 'circle', type: 'pie' }]} title={title} xAxis={[{ position: 'none' }]} yAxis={[{ position: 'none' }]}>
      <ChartsSurface sx={{ maxHeight: '85%' }}>
        <PiePlot slotProps={{ pieArc: { stroke: theme.palette.common.white, strokeWidth: 0 } }} />
      </ChartsSurface>
      <ChartsTooltip />
      <ChartsLegends />
    </ChartDataProvider>
  )
}
