import DialogMUI from '@mui/material/Dialog'
import { styled } from '@mui/material/styles'

import type { DialogProps } from './dialog.types'

export const DialogStyled = styled(DialogMUI)<DialogProps>(
  ({ theme }) => `
  && {
    & .MuiBackdrop-root {
      background: ${theme.palette.common.black}40;
    }

    & .MuiDialog-container > .MuiPaper-root {
      background: ${theme.palette.background.default};
      border: 1px solid ${theme.palette.divider};
      border-radius: ${theme.shape.borderRadius * 2}px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }
  }
`
)
