import { forwardRef } from 'react'

import { ListSubheaderStyled } from './list-subheader.styles'
import type { ListSubheaderProps } from './list-subheader.types'

export const ListSubheader = forwardRef<HTMLLIElement, ListSubheaderProps>(({ children, color, ...props }, ref) => {
  return <ListSubheaderStyled {...{ color, ref, ...props }}>{children}</ListSubheaderStyled>
})

ListSubheader.displayName = 'ListSubheader'
