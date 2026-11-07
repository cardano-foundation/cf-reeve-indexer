import BottomNavigation from '@mui/material/BottomNavigation'
import { styled } from 'styled-components'

export const LayoutBottomNavigationStyled = styled(BottomNavigation)`
  && {
    view-transition-name: bottom-navigation;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4.5rem;
    background: ${({ theme }) => theme.palette.background.default};
    border-top: ${({ theme }) => `1px solid ${theme.palette.divider}`};
    z-index: ${({ theme }) => theme.zIndex.appBar};

    .MuiBottomNavigationAction-root {
      min-width: 0;
      padding: ${({ theme }) => theme.spacing(0, 0.5)};
    }

    .MuiBottomNavigationAction-label {
      position: absolute;
      width: 1px;
      height: 1px;
      margin: -1px;
      padding: 0;
      border: 0;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
  }
`
