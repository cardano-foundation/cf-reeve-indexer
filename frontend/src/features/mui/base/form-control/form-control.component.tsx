import { forwardRef } from 'react'

import { FormControlStyled } from './form-control.styles'
import type { FormControlProps } from './form-control.types'

export const FormControl = forwardRef<HTMLDivElement, FormControlProps>(({ children, fullWidth = true, ...props }, ref) => {
  return <FormControlStyled {...{ ref, fullWidth, ...props }}>{children}</FormControlStyled>
})

FormControl.displayName = 'FormControl'
