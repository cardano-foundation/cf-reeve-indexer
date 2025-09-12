import Grid from '@mui/material/Grid'
import { styled } from 'styled-components'

interface LayoutAuthPagesContentStyledProps {
  $bgImage: string
}

export const LayoutAuthPagesContentStyled = styled(Grid)<LayoutAuthPagesContentStyledProps>`
  && {
    background: ${({ theme }) => theme.palette.background.paper};
    background-image: url(${({ $bgImage }) => $bgImage});
    background-size: cover;
    background-position: center;
    overflow: hidden auto;
  }
`
