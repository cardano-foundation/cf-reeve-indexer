import { useTheme } from '@mui/material'
import Autocomplete, { AutocompleteProps } from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import { ArrowDown2 } from 'iconsax-react'
import { ReactElement, ReactNode, ReactPortal } from 'react'

import { Checkbox } from 'libs/ui-kit/components/Checkbox/Checkbox.component.tsx'
import { Chip } from 'libs/ui-kit/components/Chip/Chip.component.tsx'
import { opacityColors } from 'libs/ui-kit/theme/colors.ts'

export interface AutocompleteMultipleOption {
  name: string | number | boolean | ReactElement | Iterable<ReactNode> | ReactPortal | (string | undefined)[] | null | undefined
  value: string
  group?: string
}

export interface InputAutocompleteMultipleProps extends Omit<AutocompleteProps<AutocompleteMultipleOption, true, false, false>, 'renderInput'> {
  items: AutocompleteMultipleOption[]
  label: ReactNode
  name: string
  value: AutocompleteMultipleOption[] | undefined
  placeholder?: string
}

export const InputAutocompleteMultiple = ({ items, groupBy, label, onChange, renderGroup, value, disabled, placeholder }: InputAutocompleteMultipleProps) => {
  const theme = useTheme()

  return (
    <Box>
      <FormControl fullWidth>
        <Autocomplete
          multiple
          id="checkboxes-tags-demo"
          options={items}
          size="small"
          disableCloseOnSelect
          getOptionLabel={(option) => option.name as string}
          groupBy={groupBy}
          renderGroup={renderGroup}
          renderOption={(props, option, { selected }) => (
            <li {...props}>
              <Checkbox checked={selected} />
              {option.name}
            </li>
          )}
          renderInput={(params) => <TextField {...params} label={label} placeholder={placeholder} />}
          renderValue={(selected, getItemProps) => {
            if (selected.length === 0) return null

            return selected.map(({ name }, index) => {
              const { key, ...rest } = getItemProps({ index })

              return <Chip key={key} label={name} {...rest} />
            })
          }}
          value={value}
          disabled={disabled}
          popupIcon={<ArrowDown2 />}
          slotProps={{
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
                background: theme.palette.background.default,
                borderRadius: '0.5rem',
                boxShadow: `0 4px 16px -1px rgba(0, 0, 0, 0.1)`,

                '& .MuiAutocomplete-listbox': {
                  maxHeight: '11.25rem',
                  padding: '0.5rem',
                  borderRadius: '1rem',

                  '& .MuiAutocomplete-option': {
                    marginBottom: '4px',
                    borderRadius: '6px',

                    '&:last-of-type': {
                      marginBottom: 0
                    },
                    '&.Mui-focused': {
                      backgroundColor: opacityColors.button[2]
                    },
                    '&.Mui-focusVisible': {
                      backgroundColor: opacityColors.button[2]
                    },
                    '&:active': {
                      backgroundColor: opacityColors.button[2]
                    },
                    '&[aria-selected="true"]': {
                      backgroundColor: opacityColors.button[4],

                      '&.Mui-focused': {
                        backgroundColor: opacityColors.button[2]
                      }
                    }
                  }
                }
              }
            }
          }}
          sx={{
            '.MuiInputBase-root': {
              background: theme.palette.common.white,
              borderRadius: '0.5rem',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.1)'
            }
          }}
          onChange={onChange}
          isOptionEqualToValue={(option, selected) => option.value === selected.value}
        />
      </FormControl>
    </Box>
  )
}
