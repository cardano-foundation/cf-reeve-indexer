import { DialogStyled } from './dialog.styles'
import type { DialogProps } from './dialog.types'

export const Dialog = ({ children, maxWidth, scroll = 'paper', disablePortal = false, disableScrollLock = false, fullWidth = true, open, ...props }: DialogProps) => {
  return (
    <DialogStyled aria-describedby="dialog-description" aria-labelledby="dialog-title" {...{ maxWidth, scroll, disablePortal, disableScrollLock, fullWidth, open, ...props }}>
      {children}
    </DialogStyled>
  )
}
