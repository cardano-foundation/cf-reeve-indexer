import { ButtonProps as ButtonPropsMUI } from '@mui/material/Button'
import { forwardRef, ReactNode } from 'react'

import { ButtonPrimaryStyled } from 'libs/ui-kit/components/ButtonPrimary/ButtonPrimary.styles.tsx'

interface ButtonPrimaryProps extends ButtonPropsMUI {
  to?: string
  children: ReactNode
}

export const ButtonPrimary = forwardRef<HTMLButtonElement, ButtonPrimaryProps>(({ children, to, ...props }, ref) => {
  return (
    <ButtonPrimaryStyled ref={ref} size="medium" variant="contained" to={to} {...props}>
      {children}
    </ButtonPrimaryStyled>
  )
})

ButtonPrimary.displayName = 'ButtonPrimary'
