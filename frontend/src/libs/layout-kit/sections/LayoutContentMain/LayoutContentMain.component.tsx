import Box, { BoxProps as BoxPropsMUI } from '@mui/material/Box'
import { ReactNode } from 'react'

import { LayoutContentMainStyled } from 'libs/layout-kit/sections/LayoutContentMain/LayoutContentMain.styles.tsx'

interface LayoutContentMainProps extends BoxPropsMUI {
  children: ReactNode
  isHeightRestricted?: boolean
  hasMinContentHeight?: boolean
}

export const LayoutContentMain = ({ children, isHeightRestricted, hasMinContentHeight, ...props }: LayoutContentMainProps) => {
  return (
    <LayoutContentMainStyled component="main" container direction="column" $isHeightRestricted={isHeightRestricted} $hasMinContentHeight={hasMinContentHeight}>
      <Box display="flex" flex="1 1 100%" height="100%" minHeight={hasMinContentHeight ? 'auto' : 0} width="100%" {...props}>
        {children}
      </Box>
    </LayoutContentMainStyled>
  )
}
