import type { AutocompleteOption, AutocompleteProps, TextFieldProps } from 'features/mui/base'

export interface ComboboxProps<
  Value extends AutocompleteOption = AutocompleteOption,
  Multiple extends boolean | undefined = true,
  DisableClearable extends boolean | undefined = boolean,
  FreeSolo extends boolean | undefined = boolean
> extends Omit<AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo>, 'multiple' | 'renderInput'> {
  textField: Pick<TextFieldProps, 'helperText' | 'label' | 'name' | 'placeholder' | 'disabled' | 'error' | 'required'>
}
