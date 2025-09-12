import { forwardRef } from 'react'

import { MenuListStyled } from './menu-list.styles'
import type { MenuListProps } from './menu-list.types'

export const MenuList = forwardRef<HTMLUListElement, MenuListProps>(({ children, component = 'ul', ...props }, ref) => {
  return <MenuListStyled {...{ component, ref, ...props }}>{children}</MenuListStyled>
})

MenuList.displayName = 'MenuList'
