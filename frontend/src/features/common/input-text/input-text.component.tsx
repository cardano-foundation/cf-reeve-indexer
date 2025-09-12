import { InputTextStyled } from './input-text.styles'
import type { InputTextProps } from './input-text.types'

export const InputText = ({ helperText, label, name, type, disabled, error, required, ...props }: InputTextProps) => {
  return <InputTextStyled {...{ helperText, label, name, type, disabled, error, required, ...props }} />
}
