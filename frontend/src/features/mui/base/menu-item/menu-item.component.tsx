import { forwardRef } from 'react'

import { MenuItemStyled } from './menu-item.styles'
import type { MenuItemProps } from './menu-item.types'

export const MenuItem = forwardRef<HTMLLIElement, MenuItemProps>(({ children, ...props }, ref) => {
  return <MenuItemStyled {...{ ref, ...props }}>{children}</MenuItemStyled>
})

MenuItem.displayName = 'MenuItem'
