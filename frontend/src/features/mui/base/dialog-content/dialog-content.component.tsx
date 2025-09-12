import { DialogContentStyled } from './dialog-content.styles'
import type { DialogContentProps } from './dialog-content.types'

export const DialogContent = ({ children, dividers = false, ...props }: DialogContentProps) => {
  return <DialogContentStyled {...{ dividers, ...props }}>{children}</DialogContentStyled>
}
