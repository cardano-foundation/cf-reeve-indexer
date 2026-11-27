import styled from 'styled-components'

import { Modal } from 'features/common'
import { Grid } from 'features/mui/base'

export const ActionsStyled = styled(Modal.Actions)(
  ({ theme }) => `
  && {
    border-top: 1px solid ${theme.palette.divider};

    ${theme.breakpoints.down('sm')} {
      gap: ${theme.spacing(1)};
      margin-top: auto;
      padding: ${theme.spacing(2)};
      padding-bottom: calc(${theme.spacing(2)} + env(safe-area-inset-bottom, 0px));

      & > * {
        flex: 1 1 0;
        min-width: 0;
        margin: 0;
      }
    }
  }
`
)

export const ModalContentStyled = styled(Modal.Content)(
  ({ theme }) => `
  &&& {
    ${theme.breakpoints.down('sm')} {
      padding-top: ${theme.spacing(1)};
    }
  }
`
)

export const ContentStyled = styled(Grid)(
  ({ theme }) => `
  && {
    padding: ${theme.spacing(2)};
    background: ${theme.palette.background.default};
    border: 1px solid ${theme.palette.divider};
    border-radius: ${Number(theme.shape.borderRadius) * 2}px;

    ${theme.breakpoints.up('sm')} {
      padding: ${theme.spacing(3)};
    }
  }
`
)