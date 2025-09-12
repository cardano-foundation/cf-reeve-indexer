import type { TextFieldProps } from 'features/mui/base'
import type { DatePickerProps } from 'features/mui/x-date-pickers'

export interface DateComboboxProps extends DatePickerProps {
  textField: Pick<TextFieldProps, 'error' | 'helperText' | 'label' | 'required'>
}

export interface DateComboboxStyledProps extends DatePickerProps {}
