import { type AutocompleteProps as AutocompleteMUIProps } from '@mui/material/Autocomplete'

export interface AutocompleteOption {
  description?: string
  label: string
  value: string
  group?: string
}

export type AutocompleteProps<
  Value,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
  ChipComponent extends React.ElementType = 'div'
> = AutocompleteMUIProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>
