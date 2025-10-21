import Grid, { GridProps as GridPropsMUI } from '@mui/material/Grid'
import { styled } from 'styled-components'

interface LayoutContentStyledProps extends GridPropsMUI {
  $isPublic?: boolean
}

export const LayoutContentStyled = styled(Grid)<LayoutContentStyledProps>`
  && {
    padding: 0;
    background: ${({ theme }) => theme.palette.background.paper};
    overflow: hidden auto;
    transition:
      margin 0.225s cubic-bezier(0, 0, 0.2, 1),
      padding 0.3s ease-in-out;

    ${({ theme, $isPublic }) => `
      ${theme.breakpoints.down('sm')} {
        margin: 0;
        padding: ${$isPublic ? theme.spacing(0) : theme.spacing(0, 0, 0, 11)};
        overflow: initial;
      }
    `}
  }
`
