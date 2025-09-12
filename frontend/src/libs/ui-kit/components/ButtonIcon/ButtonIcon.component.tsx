import { IconButtonProps as IconButtonPropsMUI } from '@mui/material/IconButton'
import { forwardRef } from 'react'

import { ButtonIconStyled } from 'libs/ui-kit/components/ButtonIcon/ButtonIcon.styles.tsx'

interface ButtonIconProps extends IconButtonPropsMUI {
  to?: string
  variant?: 'default' | 'outlined'
}

export const ButtonIcon = forwardRef<HTMLButtonElement, ButtonIconProps>(({ children, variant = 'default', disabled, ...props }, ref) => {
  return (
    <ButtonIconStyled ref={ref} size="medium" disabled={disabled} $variant={variant} {...props}>
      {children}
    </ButtonIconStyled>
  )
})

ButtonIcon.displayName = 'ButtonIcon'
