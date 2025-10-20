import { ReactNode } from 'react'

import { LayoutContentStyled } from 'libs/layout-kit/sections/LayoutContent/LayoutContent.styles.tsx'

interface LayoutContentProps {
  children: ReactNode
  isPublic?: boolean
}

export const LayoutContent = ({ children, isPublic }: LayoutContentProps) => {
  return (
    <LayoutContentStyled container direction="column" height="100%" size="grow" wrap="nowrap" $isPublic={isPublic}>
      {children}
    </LayoutContentStyled>
  )
}
