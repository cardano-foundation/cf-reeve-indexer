import { BarPlot as BarPlotMUI, BarPlotProps as BarPlotPropsMUI } from '@mui/x-charts'

interface BarPlotProps extends BarPlotPropsMUI {}

export const BarPlot = ({ barLabel, borderRadius, slotProps, ...props }: BarPlotProps) => {
  return <BarPlotMUI barLabel={barLabel} borderRadius={borderRadius} slotProps={slotProps} {...props} />
}
