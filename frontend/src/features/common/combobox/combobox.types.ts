import type { AutocompleteProps, TextFieldProps } from 'features/mui/base'

export interface ComboboxProps<
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
  ChipComponent extends React.ElementType = 'div'
> extends Omit<AutocompleteProps<Multiple, DisableClearable, FreeSolo, ChipComponent>, 'renderInput'> {
  textField: Pick<TextFieldProps, 'helperText' | 'label' | 'name' | 'placeholder' | 'disabled' | 'error' | 'required'>
  isGroupRendered?: boolean
}

export interface ListItemStyledProps {
  $isMultiple?: boolean
}
