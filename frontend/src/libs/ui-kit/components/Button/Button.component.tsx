import { ButtonProps as ButtonPropsMUI } from '@mui/material'
import { ReactNode, forwardRef } from 'react'

import { StyledButton } from 'libs/ui-kit/components/Button/Button.styles'

interface ButtonProps extends ButtonPropsMUI {
  children: ReactNode
  to?: string
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ children, ...props }, ref) => {
  return (
    <StyledButton ref={ref} {...props}>
      {children}
    </StyledButton>
  )
})

Button.displayName = 'Button'
