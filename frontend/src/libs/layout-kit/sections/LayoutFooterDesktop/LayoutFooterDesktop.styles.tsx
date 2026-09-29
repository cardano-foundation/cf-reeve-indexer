import Grid, { GridProps as GridPropsMUI } from '@mui/material/Grid'
import { styled } from 'styled-components'

export const LayoutFooterDesktopStyled = styled(Grid)<GridPropsMUI>`
  && {
    padding: ${({ theme }) => theme.spacing(2, 6)};
    background: ${({ theme }) => theme.palette.background.default};
    border-top: ${({ theme }) => `1px solid ${theme.palette.divider}`};
    flex-shrink: 0;
  }
`
