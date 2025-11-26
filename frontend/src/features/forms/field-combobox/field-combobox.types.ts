import type { AutocompleteProps, TextFieldProps } from 'features/mui/base'

export type FieldComboboxProps<
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
  ChipComponent extends React.ElementType = 'div'
> = Pick<TextFieldProps, 'helperText' | 'label' | 'name' | 'disabled' | 'error' | 'required'> &
  Pick<AutocompleteProps<Multiple, DisableClearable, FreeSolo, ChipComponent>, 'limitTags' | 'options' | 'onChange' | 'multiple'> & {
    name: NonNullable<TextFieldProps['name']>
    isGroupRendered?: boolean
  }
