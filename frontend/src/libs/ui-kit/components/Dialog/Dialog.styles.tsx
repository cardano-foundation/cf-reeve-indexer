import Dialog from '@mui/material/Dialog'
import { styled } from 'styled-components'

export const DialogStyled = styled(Dialog)`
  && {
    & .MuiBackdrop-root {
      background: ${({ theme }) => `${theme.palette.common.black}40`};
    }

    & .MuiDialog-container > .MuiPaper-root {
      background: ${({ theme }) => theme.palette.background.default};
      border-radius: ${({ theme }) => `${theme.shape.borderRadius * 2}px`};
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }
  }
`
