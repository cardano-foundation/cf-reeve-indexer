import { forwardRef } from 'react'

import { ListStyled } from './list.styles'
import type { ListProps } from './list.types'

export const List = forwardRef<HTMLUListElement, ListProps>(({ children, ...props }, ref) => {
  return <ListStyled {...{ ref, ...props }}>{children}</ListStyled>
})

List.displayName = 'List'
