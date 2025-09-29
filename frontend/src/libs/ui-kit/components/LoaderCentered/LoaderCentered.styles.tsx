import CircularProgress from '@mui/material/CircularProgress'
import { styled } from 'styled-components'

export const CircularProgressStyled = styled(CircularProgress)`
  && {
    color: ${({ theme }) => theme.palette.action.disabled};
  }
`
