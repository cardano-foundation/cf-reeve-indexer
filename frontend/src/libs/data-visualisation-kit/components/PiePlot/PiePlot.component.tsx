import { PiePlot as PiePlotMUI, PiePlotProps as PiePlotPropsMUI } from '@mui/x-charts'

interface PiePlotProps extends PiePlotPropsMUI {}

export const PiePlot = ({ slotProps, ...props }: PiePlotProps) => {
  return <PiePlotMUI slotProps={slotProps} {...props} />
}
