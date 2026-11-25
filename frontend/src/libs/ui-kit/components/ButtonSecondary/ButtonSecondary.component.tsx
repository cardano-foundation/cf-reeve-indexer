import { ButtonProps as ButtonPropsMUI } from '@mui/material/Button'
import { forwardRef, ReactNode } from 'react'
import { LinkProps } from 'react-router-dom'

import { Button } from 'libs/ui-kit/components/Button/Button.component.tsx'

interface ButtonSecondaryProps extends ButtonPropsMUI {
  state?: LinkProps['state']
  to?: string
  children: ReactNode
}

export const ButtonSecondary = forwardRef<HTMLButtonElement, ButtonSecondaryProps>(({ children, ...rest }, ref) => {
  return (
    <Button ref={ref} size="medium" variant="outlined" {...rest}>
      {children}
    </Button>
  )
})

ButtonSecondary.displayName = 'ButtonSecondary'
