import { forwardRef } from 'react'

import { BoxStyled } from './box.styles'
import type { BoxProps } from './box.types'

export const Box = forwardRef<HTMLElement, BoxProps>(({ children, ...props }, ref) => {
  return <BoxStyled {...{ ref, ...props }}>{children}</BoxStyled>
})

Box.displayName = 'Box'
