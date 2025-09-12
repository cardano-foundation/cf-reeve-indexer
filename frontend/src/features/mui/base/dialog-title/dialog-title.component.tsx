import { DialogTitleStyled } from './dialog-title.styles'
import type { DialogTitleProps } from './dialog-title.types'

export const DialogTitle = ({ children, component, variant = 'h2', ...props }: DialogTitleProps) => {
  return <DialogTitleStyled {...{ component, variant, ...props }}>{children}</DialogTitleStyled>
}
