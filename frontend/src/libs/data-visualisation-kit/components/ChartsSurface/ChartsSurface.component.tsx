import { type ChartsSurfaceProps as ChartSurfacePropsMUI } from '@mui/x-charts'

import { ChartsSurfaceStyled } from 'libs/data-visualisation-kit/components/ChartsSurface/ChartsSurface.styles.tsx'

interface ChartsSurfaceProps extends ChartSurfacePropsMUI {}

export const ChartsSurface = ({ children, ...props }: ChartsSurfaceProps) => {
  return <ChartsSurfaceStyled {...props}>{children}</ChartsSurfaceStyled>
}
