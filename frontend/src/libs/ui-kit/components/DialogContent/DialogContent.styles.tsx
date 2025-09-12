import DialogContent from '@mui/material/DialogContent'
import { styled } from 'styled-components'

export const DialogContentStyled = styled(DialogContent)`
  && {
    padding: ${({ theme }) => theme.spacing(3)};

    ${({ theme }) => `
      ${theme.breakpoints.down('sm')} {
        padding: ${theme.spacing(3, 2)};
      }
    `}
`
