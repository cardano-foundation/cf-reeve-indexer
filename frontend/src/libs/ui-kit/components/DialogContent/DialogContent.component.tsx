import { DialogContentProps as DialogContentPropsMUI } from '@mui/material/DialogContent'

import { DialogContentStyled } from 'libs/ui-kit/components/DialogContent/DialogContent.styles.tsx'

interface DialogContentProps extends DialogContentPropsMUI {}

export const DialogContent = ({ children, ...props }: DialogContentProps) => {
  return <DialogContentStyled {...props}>{children}</DialogContentStyled>
}
