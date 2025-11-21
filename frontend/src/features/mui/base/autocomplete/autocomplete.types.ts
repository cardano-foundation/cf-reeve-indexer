import { type AutocompleteProps as AutocompleteMUIProps } from '@mui/material/Autocomplete'

export interface AutocompleteOption {
  description?: string
  label: string
  value: string
  group?: string
}

export interface AutocompleteProps<
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
  ChipComponent extends React.ElementType = 'div'
> extends AutocompleteMUIProps<AutocompleteOption, Multiple, DisableClearable, FreeSolo, ChipComponent> {}
