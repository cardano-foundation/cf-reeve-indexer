import { forwardRef } from 'react'

import { FormHelperTextStyled } from './form-helper-text.styles'
import type { FormHelperTextProps } from './form-helper-text.types'

export const FormHelperText = forwardRef<HTMLParagraphElement, FormHelperTextProps>(
  ({ children, component, variant = 'outlined', disabled, error = false, required = false, ...props }, ref) => {
    return <FormHelperTextStyled {...{ component, ref, variant, disabled, error, required, ...props }}>{children}</FormHelperTextStyled>
  }
)

FormHelperText.displayName = 'FormHelperText'
