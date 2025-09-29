import { forwardRef } from 'react'

import { GridStyled } from './grid.styles'
import type { GridProps } from './grid.types'

export const Grid = forwardRef<HTMLDivElement, GridProps>(({ children, ...props }, ref) => {
  return <GridStyled {...{ ref, ...props }}>{children}</GridStyled>
})

Grid.displayName = 'Grid'
