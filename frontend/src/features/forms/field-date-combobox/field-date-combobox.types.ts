import type { TextFieldProps } from 'features/mui/base'
import type { DatePickerProps } from 'features/mui/x-date-pickers'

export type FieldDateComboboxProps = Pick<TextFieldProps, 'helperText' | 'label' | 'disabled' | 'required'> &
  Pick<DatePickerProps, 'maxDate' | 'minDate'> & {
    name: NonNullable<TextFieldProps['name']>
  }
