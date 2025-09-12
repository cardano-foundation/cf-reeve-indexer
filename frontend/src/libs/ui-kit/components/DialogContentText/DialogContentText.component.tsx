import { DialogContentTextProps as DialogContentTextPropsMUI } from '@mui/material/DialogContentText'

import { DialogContentTextStyled } from 'libs/ui-kit/components/DialogContentText/DialogContentText.styles.tsx'

interface DialogContentTextProps extends DialogContentTextPropsMUI {}

export const DialogContentText = ({ children, ...props }: DialogContentTextProps) => {
  return <DialogContentTextStyled {...props}>{children}</DialogContentTextStyled>
}
