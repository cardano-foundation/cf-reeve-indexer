import { TooltipProps as TooltipPropsMUI } from '@mui/material/Tooltip'

import { TooltipStyled } from './Tooltip.styles.tsx'

export interface TooltipProps extends TooltipPropsMUI {}

export const Tooltip = ({ children, ...props }: TooltipProps) => {
  return (
    <TooltipStyled placement="top" arrow {...props}>
      {children}
    </TooltipStyled>
  )
}
