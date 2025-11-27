import AutocompleteMUI from '@mui/material/Autocomplete'

import { PopupIconStyled } from './autocomplete.styles'
import type { AutocompleteProps } from './autocomplete.types'

export const Autocomplete = <
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
  ChipComponent extends React.ElementType = 'div'
>({
  limitTags,
  options,
  size = 'small',
  slotProps,
  value,
  groupBy,
  renderGroup,
  renderInput,
  onChange,
  disabled,
  disableClearable,
  disableCloseOnSelect = true,
  freeSolo,
  multiple,
  ...props
}: AutocompleteProps<Multiple, DisableClearable, FreeSolo, ChipComponent>) => {
  return (
    <AutocompleteMUI
      popupIcon={<PopupIconStyled />}
      slotProps={{
        ...slotProps,
        popper: {
          modifiers: [{ name: 'offset', options: { offset: [0, 4] } }]
        }
      }}
      getOptionLabel={(option) => (typeof option === 'string' ? option : (option.label ?? ''))}
      isOptionEqualToValue={(option, selected) => option.value === selected.value}
      {...{ limitTags, options, size, value, groupBy, renderGroup, renderInput, onChange, disabled, disableClearable, disableCloseOnSelect, freeSolo, multiple, ...props }}
    />
  )
}
