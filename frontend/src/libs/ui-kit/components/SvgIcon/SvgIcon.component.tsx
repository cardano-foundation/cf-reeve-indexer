import { SvgIconProps as SvgIconPropsMUI } from '@mui/material/SvgIcon'

import { SvgIconStyled } from 'libs/ui-kit/components/SvgIcon/SvgIcon.styles.tsx'

interface SvgIconProps extends SvgIconPropsMUI {}

export const SvgIcon = ({ children, ...props }: SvgIconProps) => {
  return (
    <SvgIconStyled inheritViewBox {...props}>
      {children}
    </SvgIconStyled>
  )
}
