import { BottomNavigationProps as BottomNavigationPropsMUI } from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'

import { LayoutBottomNavigationStyled } from 'libs/layout-kit/sections/LayoutBottomNavigation/LayoutBottomNavigation.styles.tsx'

interface LayoutBottomNavigationProps extends BottomNavigationPropsMUI {}

export const LayoutBottomNavigation = ({ children, ...props }: LayoutBottomNavigationProps) => {
  return (
    <LayoutBottomNavigationStyled showLabels {...props}>
      {children}
    </LayoutBottomNavigationStyled>
  )
}

LayoutBottomNavigation.Action = BottomNavigationAction
