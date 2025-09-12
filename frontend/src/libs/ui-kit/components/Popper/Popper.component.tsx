import { PopperProps as PopperPropsMUI } from '@mui/material/Popper'

import { PopperStyled } from 'libs/ui-kit/components/Popper/Popper.styles.tsx'

interface PopperProps extends PopperPropsMUI {}

export const Popper = ({ anchorEl, children, open, ...props }: PopperProps) => {
  return (
    <PopperStyled anchorEl={anchorEl} open={open} {...props}>
      {children}
    </PopperStyled>
  )
}
