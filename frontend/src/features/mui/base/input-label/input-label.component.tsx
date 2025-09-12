import { forwardRef } from 'react'

import { InputLabelStyled } from './input-label.styles'
import type { InputLabelProps } from './input-label.types'

export const InputLabel = forwardRef<HTMLLabelElement, InputLabelProps>(({ children, size = 'small', ...props }, ref) => {
  return <InputLabelStyled {...{ ref, size, ...props }}>{children}</InputLabelStyled>
})

InputLabel.displayName = 'InputLabel'
