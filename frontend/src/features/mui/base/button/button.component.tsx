import React, { forwardRef } from 'react'

import { ButtonStyled } from './button.styles'
import type { ButtonProps } from './button.types'

export const Button = forwardRef(
  <C extends React.ElementType = 'button'>({ children, component, size = 'medium', variant, ...props }: ButtonProps<C>, ref: React.ForwardedRef<HTMLButtonElement>) => (
    <ButtonStyled {...{ component, ref, size, variant, ...props }}>{children}</ButtonStyled>
  )
)

Button.displayName = 'Button'
