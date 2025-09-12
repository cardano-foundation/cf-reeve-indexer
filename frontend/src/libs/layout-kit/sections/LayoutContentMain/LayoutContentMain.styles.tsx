import Grid, { GridProps as GridPropsMUI } from '@mui/material/Grid'
import { styled } from 'styled-components'

interface LayoutContentMainStyledProps extends GridPropsMUI {
  $isHeightRestricted?: boolean
}

export const LayoutContentMainStyled = styled(Grid)<LayoutContentMainStyledProps>`
  && {
    min-height: ${({ $isHeightRestricted }) => ($isHeightRestricted ? 0 : 'unset')};
    height: ${({ $isHeightRestricted }) => ($isHeightRestricted ? '100%' : 'auto')};
    padding: ${({ theme }) => theme.spacing(6)};
    flex: 1 1 100%;

    ${({ theme }) => `
    ${theme.breakpoints.down('sm')} {
        padding: ${theme.spacing(2)};
      }
    `}

    ${({ theme }) => `
      @media (max-height: 37.5rem) {
        padding: ${theme.spacing(2)};
        min-height: initial;
      }
    `}
  }
`
