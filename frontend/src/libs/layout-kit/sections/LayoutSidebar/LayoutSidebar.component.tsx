import { ReactNode } from 'react'

import { ButtonToggleSidebar } from 'libs/layout-kit/components/ButtonToggleSidebar/ButtonToggleSidebar.component.tsx'
import { LayoutSidebarStyled } from 'libs/layout-kit/sections/LayoutSidebar/LayoutSidebar.styles.tsx'

interface LayoutSidebarProps {
  children: ReactNode
  onToggleSidebar: () => void
  isSidebarOpen: boolean
}

export const LayoutSidebar = ({ children, onToggleSidebar, isSidebarOpen }: LayoutSidebarProps) => {
  return (
    <LayoutSidebarStyled component="aside" container data-testid="sidebar" direction="column" $isSidebarOpen={isSidebarOpen}>
      <ButtonToggleSidebar onToggleSidebar={onToggleSidebar} isSidebarOpen={isSidebarOpen} />
      {children}
    </LayoutSidebarStyled>
  )
}
