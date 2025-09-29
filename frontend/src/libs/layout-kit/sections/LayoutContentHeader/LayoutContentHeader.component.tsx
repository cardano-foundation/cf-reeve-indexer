import { useMediaQuery, useTheme } from '@mui/material'
import Box, { BoxProps as BoxPropsMUI } from '@mui/material/Box'
import { ReactNode } from 'react'

import { Details } from 'libs/layout-kit/components/Details/Details.component.tsx'
import { Organisation } from 'libs/layout-kit/layout-public/components/Organisation/Organisation.component.tsx'
import { LayoutContentHeaderStyled } from 'libs/layout-kit/sections/LayoutContentHeader/LayoutContentHeader.styles.tsx'
import { ButtonBack } from 'libs/ui-kit/components/ButtonBack/ButtonBack.component.tsx'

interface LayoutContentHeaderProps extends BoxPropsMUI {
  children: ReactNode
  isPublic?: boolean
}

export const LayoutContentHeader = ({ children, isPublic, ...props }: LayoutContentHeaderProps) => {
  const theme = useTheme()

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <LayoutContentHeaderStyled component="header">
      <Box alignItems="center" display="flex" gap={{ xs: 2, sm: 3 }} height="100%" width="100%" {...props}>
        {children}
        {isPublic && isMobile && <Organisation />}
      </Box>
    </LayoutContentHeaderStyled>
  )
}

LayoutContentHeader.ButtonBack = ButtonBack
LayoutContentHeader.Details = Details
