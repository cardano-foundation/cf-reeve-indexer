import DialogActions from '@mui/material/DialogActions'
import { styled } from 'styled-components'

export const DialogActionsStyled = styled(DialogActions)`
  && {
    padding: ${({ theme }) => theme.spacing(2)};
  }
`
