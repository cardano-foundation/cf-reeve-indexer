import { forwardRef } from 'react'

import { ListItemStyled } from './list-item.styles'
import type { ListItemProps } from './list-item.types'

export const ListItem = forwardRef<HTMLLIElement, ListItemProps>(({ children, ...props }, ref) => {
  return <ListItemStyled {...{ ref, ...props }}>{children}</ListItemStyled>
})

ListItem.displayName = 'ListItem'
