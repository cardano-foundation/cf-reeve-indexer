import { forwardRef } from 'react'

import { TypographyStyled } from './typography.styles'
import type { TypographyProps } from './typography.types'

export const Typography = forwardRef<HTMLSpanElement, TypographyProps>(({ children, component, variant, ...props }, ref) => {
  return <TypographyStyled {...{ component, ref, variant, ...props }}>{children}</TypographyStyled>
})

Typography.displayName = 'Typography'
