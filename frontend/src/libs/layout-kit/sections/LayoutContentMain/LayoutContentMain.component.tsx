import Box, { BoxProps as BoxPropsMUI } from '@mui/material/Box'
import { ReactNode } from 'react'

import { LayoutContentMainStyled } from 'libs/layout-kit/sections/LayoutContentMain/LayoutContentMain.styles.tsx'

interface LayoutContentMainProps extends BoxPropsMUI {
  children: ReactNode
  isHeightRestricted?: boolean
}

export const LayoutContentMain = ({ children, isHeightRestricted, ...props }: LayoutContentMainProps) => {
  return (
    <LayoutContentMainStyled component="main" container direction="column" $isHeightRestricted={isHeightRestricted}>
      <Box display="flex" flex="1 1 100%" height="100%" minHeight={0} width="100%" {...props}>
        {children}
      </Box>
    </LayoutContentMainStyled>
  )
}
