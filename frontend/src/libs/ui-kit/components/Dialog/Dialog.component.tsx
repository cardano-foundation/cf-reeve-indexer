import { DialogProps as DialogPropsMUI } from '@mui/material/Dialog'

import { DialogStyled } from 'libs/ui-kit/components/Dialog/Dialog.styles.tsx'

interface DialogProps extends DialogPropsMUI {}

export const Dialog = ({ children, ...props }: DialogProps) => {
  return <DialogStyled {...props}>{children}</DialogStyled>
}
