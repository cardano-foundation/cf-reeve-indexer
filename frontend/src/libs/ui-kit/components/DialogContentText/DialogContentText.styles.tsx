import DialogContentText from '@mui/material/DialogContentText'
import { styled } from 'styled-components'

export const DialogContentTextStyled = styled(DialogContentText)`
  && {
    color: ${({ theme }) => theme.palette.text.primary};
  }
`
