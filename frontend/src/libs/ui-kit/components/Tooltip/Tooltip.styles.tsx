import Tooltip, { TooltipProps as TooltipPropsMUI } from '@mui/material/Tooltip'
import { styled } from 'styled-components'

interface TooltipStyledProps extends TooltipPropsMUI {
  className?: string
}

export const TooltipStyled = styled(({ className, ...props }: TooltipStyledProps) => <Tooltip {...props} slotProps={{ popper: { className } }} />)`
  & .MuiTooltip-tooltip {
    max-width: none;
    background: ${({ theme }) => theme.palette.common.black};
    border-radius: ${({ theme }) => `${theme.shape.borderRadius * 1.5}px`};
    color: ${({ theme }) => theme.palette.common.white};
    font-size: 0.625rem;
    line-height: 0.875rem;
    white-space: pre-wrap;
    text-align: center;
  }

  & .MuiTooltip-arrow {
    color: ${({ theme }) => theme.palette.common.black};
  }
`
