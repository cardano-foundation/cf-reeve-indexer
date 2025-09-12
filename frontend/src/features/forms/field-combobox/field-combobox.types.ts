import type { AutocompleteOption, AutocompleteProps, TextFieldProps } from 'features/mui/base'

export type FieldComboboxProps<
  Value extends AutocompleteOption = AutocompleteOption,
  Multiple extends boolean | undefined = true,
  DisableClearable extends boolean | undefined = boolean,
  FreeSolo extends boolean | undefined = boolean,
  ChipComponent extends React.ElementType = 'div'
> = Pick<TextFieldProps, 'helperText' | 'label' | 'name' | 'disabled' | 'error' | 'required'> &
  Pick<AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>, 'limitTags' | 'options'> & {
    name: NonNullable<TextFieldProps['name']>
  }
