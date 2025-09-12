import Grid, { GridProps as GridPropsMUI } from '@mui/material/Grid'
import { styled } from 'styled-components'

interface LayoutContentHeaderStyledProps extends GridPropsMUI {}

export const LayoutContentHeaderStyled = styled(Grid)<LayoutContentHeaderStyledProps>`
  && {
    max-height: 7rem;
    padding: ${({ theme }) => theme.spacing(2, 6)};
    flex: 1 0 100%;
    border-bottom: ${({ theme }) => `1px solid ${theme.palette.divider}`};

    ${({ theme }) => `
      ${theme.breakpoints.down('sm')} {
        max-height: 6rem;
        min-height: 6rem;
        padding: ${theme.spacing(2, 3)};
      }
    `}

    ${({ theme }) => `
      @media (max-height: 37.5rem) {
        max-height: 6rem;
        min-height: 6rem;
        padding: ${theme.spacing(2, 3)};
      }
    `}
  }
`
