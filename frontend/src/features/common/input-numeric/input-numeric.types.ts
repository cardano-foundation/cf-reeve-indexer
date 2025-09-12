import type { TextFieldProps } from 'features/mui/base'

export interface InputNumericProps extends Omit<TextFieldProps, 'type'> {
  valueRegex?: RegExp
}
