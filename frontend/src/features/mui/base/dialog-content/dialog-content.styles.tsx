import DialogContentMUI from '@mui/material/DialogContent'
import { styled } from '@mui/material/styles'

import type { DialogContentProps } from './dialog-content.types'

export const DialogContentStyled = styled(DialogContentMUI)<DialogContentProps>(
  ({ theme }) => `
  && {
    position: relative;
    padding: ${theme.spacing(3)};

    ${theme.breakpoints.down('sm')} {
      padding: ${theme.spacing(2)};
    }
  }
`
)
