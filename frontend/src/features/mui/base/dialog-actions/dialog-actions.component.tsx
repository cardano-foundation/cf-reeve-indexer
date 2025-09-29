import { DialogActionsStyled } from './dialog-actions.styles'
import type { DialogActionsProps } from './dialog-actions.types'

export const DialogActions = ({ children, disableSpacing = false, ...props }: DialogActionsProps) => {
  return <DialogActionsStyled {...{ disableSpacing, ...props }}>{children}</DialogActionsStyled>
}
