import { ReactNode } from 'react'

import { ChipGroupStyled } from 'libs/layout-kit/components/ChipGroup/ChipGroup.styles.tsx'

interface ChipGroupProps {
  children: ReactNode
}

export const ChipGroup = ({ children }: ChipGroupProps) => {
  return (
    <ChipGroupStyled alignItems="center" display="flex" gap={1}>
      {children}
    </ChipGroupStyled>
  )
}
