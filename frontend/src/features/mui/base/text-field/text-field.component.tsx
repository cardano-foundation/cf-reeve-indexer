import { TextFieldStyled } from './text-field.styles'
import type { TextFieldProps } from './text-field.types'

export const TextField = ({
  helperText,
  label,
  name,
  placeholder,
  size = 'small',
  type,
  value,
  variant = 'outlined',
  onChange,
  disabled,
  error = false,
  fullWidth = true,
  multiline = false,
  required = false,
  ...props
}: TextFieldProps) => {
  return (
    <TextFieldStyled id={name} {...{ helperText, label, name, placeholder, size, type, value, variant, onChange, disabled, error, fullWidth, multiline, required }} {...props} />
  )
}
