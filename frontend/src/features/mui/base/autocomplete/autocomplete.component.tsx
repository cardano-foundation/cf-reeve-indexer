import { AutocompleteStyled, PopupIconStyled } from './autocomplete.styles'
import type { AutocompleteOption, AutocompleteProps } from './autocomplete.types'

export const Autocomplete = <
  Value extends AutocompleteOption = AutocompleteOption,
  Multiple extends boolean | undefined = boolean,
  DisableClearable extends boolean | undefined = boolean,
  FreeSolo extends boolean | undefined = boolean,
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
  multiple,
  ...props
}: AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>) => {
  return (
    <AutocompleteStyled
      popupIcon={<PopupIconStyled />}
      slotProps={{
        ...slotProps,
        popper: {
          modifiers: [{ name: 'offset', options: { offset: [0, 4] } }]
        }
      }}
      getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
      isOptionEqualToValue={(option, selected) => option.value === selected.value}
      {...{ limitTags, options, size, value, groupBy, renderGroup, renderInput, onChange, disabled, disableClearable, disableCloseOnSelect, multiple, ...props }}
    />
  )
}
