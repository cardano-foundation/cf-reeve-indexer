import { ReactNode } from 'react'

import { LayoutContentStyled } from 'libs/layout-kit/sections/LayoutContent/LayoutContent.styles.tsx'

interface LayoutContentProps {
  children: ReactNode
  hasDrawer: boolean
}

export const LayoutContent = ({ children, hasDrawer }: LayoutContentProps) => {
  return (
    <LayoutContentStyled container direction="column" height="100%" size="grow" wrap="nowrap" $hasDrawer={hasDrawer}>
      {children}
    </LayoutContentStyled>
  )
}
