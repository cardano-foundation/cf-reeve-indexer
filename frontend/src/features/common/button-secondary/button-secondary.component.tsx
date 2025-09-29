import { forwardRef } from 'react'

import { ButtonSecondaryStyled } from './button-secondary.styles'
import type { ButtonSecondaryProps } from './button-secondary.types'

export const ButtonSecondary = forwardRef(<C extends React.ElementType = 'button'>({ children, ...props }: ButtonSecondaryProps<C>, ref: React.ForwardedRef<HTMLButtonElement>) => (
  <ButtonSecondaryStyled color="primary" variant="outlined" {...{ ref, ...props }}>
    {children}
  </ButtonSecondaryStyled>
))

ButtonSecondary.displayName = 'ButtonSecondary'
