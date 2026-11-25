import styled from 'styled-components'

import { Modal } from 'features/common'
import { Grid } from 'features/mui/base'

export const ActionsStyled = styled(Modal.Actions)(
  ({ theme }) => `
  && {
    border-top: 1px solid ${theme.palette.divider};
  }
`
)

export const ContentStyled = styled(Grid)(
  ({ theme }) => `
  && {
    padding: ${theme.spacing(3)};
    background: ${theme.palette.background.default};
    border: 1px solid ${theme.palette.divider};
    border-radius: ${Number(theme.shape.borderRadius) * 2}px;
  }
`
)