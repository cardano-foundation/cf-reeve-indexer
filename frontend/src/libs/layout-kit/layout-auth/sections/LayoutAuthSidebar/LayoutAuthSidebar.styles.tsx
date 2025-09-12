import Grid, { GridProps as GridPropsMUI } from '@mui/material/Grid'
import { styled } from 'styled-components'

interface SidebarStyledProps extends GridPropsMUI {
  $isSidebarOpen: boolean
}

export const SidebarStyled = styled(Grid)<SidebarStyledProps>`
  && {
    height: 100%;
    max-width: ${({ $isSidebarOpen }) => ($isSidebarOpen ? '20rem' : '5.5rem')};
    flex: 1 0 100%;
    background: ${({ theme }) => theme.palette.background.default};
    border-right: ${({ theme }) => `1px solid ${theme.palette.divider}`};
    overflow: hidden;
    transition: max-width 0.3s ease-in-out;

    ${({ theme }) => `
      ${theme.breakpoints.down('sm')} {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 5;
      }
    `}
  }
`
