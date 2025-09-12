import Box, { BoxProps as BoxPropsMUI } from '@mui/material/Box'
import Grid, { GridProps as GridPropsMUI } from '@mui/material/Grid'
import { styled } from 'styled-components'

export const LayoutFooterStyled = styled(Grid)<GridPropsMUI>`
  && {
    padding: ${({ theme }) => theme.spacing(1, 2, 10, 2)};
  }
`

export const LogoStyled = styled(Box)<BoxPropsMUI>`
  && {
    display: flex;
    width: 100%;
    align-items: center;

    svg {
      width: 100%;
    }
  }
`
