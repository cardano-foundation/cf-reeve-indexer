import { ButtonProps as ButtonPropsMUI } from '@mui/material/Button'
import { ReactNode } from 'react'
import { LinkProps } from 'react-router-dom'

import { Button } from 'libs/ui-kit/components/Button/Button.component.tsx'

interface ButtonSecondaryProps extends ButtonPropsMUI {
  state?: LinkProps['state']
  to?: string
  children: ReactNode
}

export const ButtonSecondary = ({ children, ...rest }: ButtonSecondaryProps) => {
  return (
    <Button size="medium" variant="outlined" {...rest}>
      {children}
    </Button>
  )
}
