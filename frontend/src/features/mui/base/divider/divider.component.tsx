import { forwardRef } from 'react'

import { DividerStyled } from './divider.styles'
import type { DividerProps } from './divider.types'

export const Divider = forwardRef<HTMLHRElement, DividerProps>(({ children, component, orientation, variant = 'fullWidth', ...props }, ref) => {
  return <DividerStyled {...{ component, orientation, ref, variant, ...props }}>{children}</DividerStyled>
})

Divider.displayName = 'Divider'
