import { DialogActionsProps as DialogActionsPropsMUI } from '@mui/material/DialogActions'

import { DialogActionsStyled } from 'libs/ui-kit/components/DialogActions/DialogActions.styles.tsx'

interface DialogActionsProps extends DialogActionsPropsMUI {}

export const DialogActions = ({ children, ...props }: DialogActionsProps) => {
  return <DialogActionsStyled {...props}>{children}</DialogActionsStyled>
}
