import type { SelectOption, SelectProps, TextFieldProps } from 'features/mui/base'

export type PickerProps = SelectProps &
  TextFieldProps & {
    // helperText?: TextFieldProps['helperText'];
    options: SelectOption[]
  }
