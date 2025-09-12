import { forwardRef } from 'react'

import { ButtonPrimaryStyled } from './button-primary.styles'
import type { ButtonPrimaryProps } from './button-primary.types'

export const ButtonPrimary = forwardRef(<C extends React.ElementType = 'button'>({ children, ...props }: ButtonPrimaryProps<C>, ref: React.ForwardedRef<HTMLButtonElement>) => {
  return (
    <ButtonPrimaryStyled color="primary" variant="contained" {...{ ref, ...props }}>
      {children}
    </ButtonPrimaryStyled>
  )
})

ButtonPrimary.displayName = 'ButtonPrimary'
