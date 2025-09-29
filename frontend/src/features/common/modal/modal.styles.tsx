import { styled } from 'styled-components'

import { Dialog, DialogActions, DialogContent, DialogTitle } from 'features/mui/base'

export const ModalStyled = styled(Dialog)`
  && {
    overflow: hidden;
  }
`

export const ModalActionsStyled = styled(DialogActions)``

export const ModalContentStyled = styled(DialogContent)`
  && {
    overflow: hidden auto;
  }
`

export const ModalTitleStyled = styled(DialogTitle)`
  && {
    flex: 1 1 auto;
  }
`
