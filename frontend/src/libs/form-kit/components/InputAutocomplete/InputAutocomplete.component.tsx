import { useTheme } from '@mui/material'
import Autocomplete, { AutocompleteProps as AutocompletePropsMUI } from '@mui/material/Autocomplete'
import { ArrowDown2 } from 'iconsax-react'
import { ReactNode } from 'react'

import { InputText } from 'libs/ui-kit/components/InputText/InputText.component.tsx'
import { opacityColors } from 'libs/ui-kit/theme/colors.ts'

export interface AutocompleteOption {
  name: string
  value: string
  group?: string
}

interface InputAutocompleteProps extends Omit<AutocompletePropsMUI<AutocompleteOption, boolean | undefined, boolean | undefined, boolean | undefined>, 'renderInput'> {
  label: ReactNode
  name: string
  placeholder?: string
}

export const InputAutocomplete = ({ label, name, options, placeholder, value, disabled, multiple, onChange, ...props }: InputAutocompleteProps) => {
  const theme = useTheme()

  return (
    <Autocomplete
      id={name}
      options={options}
      popupIcon={<ArrowDown2 color={theme.palette.action.active} size={18} variant="Outline" />}
      size="small"
      value={value}
      getOptionLabel={(option) => (typeof option === 'string' ? option : (option?.name ?? ''))}
      onChange={onChange}
      renderInput={(props) => <InputText {...props} slotProps={{ htmlInput: props.inputProps }} label={label} placeholder={placeholder} />}
      disabled={disabled}
      isOptionEqualToValue={(option, selected) => option.value === selected.value}
      multiple={multiple}
      slotProps={{
        popupIndicator: {
          sx: {
            margin: 0,
            padding: theme.spacing(0.375)
          }
        },
        popper: {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 4]
              }
            }
          ]
        },
        paper: {
          sx: {
            '&&': {
              background: theme.palette.background.default,
              borderRadius: '0.5rem',
              boxShadow: `0 4px 16px -1px rgba(0, 0, 0, 0.1)`
            },
            '& .MuiAutocomplete-listbox': {
              maxHeight: '11.25rem',
              padding: '0.5rem',
              borderRadius: '1rem'
            },
            '& .MuiAutocomplete-option': {
              marginBottom: '4px',
              borderRadius: '6px'
            },
            '& .MuiAutocomplete-option:last-of-type': {
              marginBottom: 0
            },
            '& .MuiAutocomplete-option.Mui-focused': {
              backgroundColor: opacityColors.button[2]
            },
            '& .MuiAutocomplete-option:active': {
              backgroundColor: opacityColors.button[2]
            },
            '& .MuiAutocomplete-option[aria-selected="true"]': {
              backgroundColor: opacityColors.button[4]
            }
          }
        }
      }}
      sx={{
        '&&.MuiInputBase-root': {
          background: theme.palette.common.white,
          borderRadius: '0.5rem',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.1)'
        }
      }}
      {...props}
    />
  )
}
