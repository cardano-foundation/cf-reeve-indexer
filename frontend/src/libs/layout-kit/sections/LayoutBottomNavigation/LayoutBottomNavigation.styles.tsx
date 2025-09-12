import BottomNavigation from '@mui/material/BottomNavigation'
import { styled } from 'styled-components'

export const LayoutBottomNavigationStyled = styled(BottomNavigation)`
  && {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4.5rem;
    background: ${({ theme }) => theme.palette.background.default};
    border-top: ${({ theme }) => `1px solid ${theme.palette.divider}`};
    z-index: ${({ theme }) => theme.zIndex.appBar};
  }
`
