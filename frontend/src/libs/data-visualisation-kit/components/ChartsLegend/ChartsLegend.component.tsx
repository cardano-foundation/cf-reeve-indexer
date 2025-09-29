import { type ChartsLegendProps as ChartsLegendPropsMUI } from '@mui/x-charts'

import { ChartsLegendStyled } from 'libs/data-visualisation-kit/components/ChartsLegend/ChartsLegend.styles.tsx'

interface ChartsLegendProps extends ChartsLegendPropsMUI {}

export const ChartsLegends = ({ direction = 'horizontal', ...props }: ChartsLegendProps) => {
  return <ChartsLegendStyled slotProps={{ legend: { direction } }} {...props} />
}
