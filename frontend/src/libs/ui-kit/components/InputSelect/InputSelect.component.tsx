import { FormHelperText, useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem, { MenuItemProps } from '@mui/material/MenuItem'
import Select, { SelectProps } from '@mui/material/Select'
import { ArrowDown2 } from 'iconsax-react'
import { isValidElement, ReactNode } from 'react'

import { opacityColors } from 'libs/ui-kit/theme/colors.ts'

export interface SelectOption {
  name: string
  value: number | string
  sx?: MenuItemProps['sx']
}

export type InputSelectProps = SelectProps & {
  helperText?: string
  items: SelectOption[]
  label: ReactNode
  value: string | number | null
  name: string
  renderValue?: (_value: unknown) => ReactNode
  renderMenuItem?: (_item: SelectOption) => ReactNode
}

export const InputSelect = ({
  helperText,
  items,
  error,
  label,
  name,
  onChange,
  value,
  renderValue,
  disabled,
  required,
  renderMenuItem = (item) => item.name,
  ...props
}: InputSelectProps) => {
  const theme = useTheme()

  // TODO: render should probably return MUI TextField or relevant
  // internal component with "select" prop set to true
  return (
    <Box width="100%">
      <FormControl error={error} fullWidth disabled={disabled}>
        <InputLabel id="demo-simple-select-label" htmlFor={`field-${name}`} size="small">
          {`${label}${required ? ' *' : ''}`}
        </InputLabel>
        <Select
          labelId="demo-simple-select-label"
          label={`${label}${required ? ' *' : ''}`}
          size="small"
          value={value}
          onChange={onChange}
          inputProps={{
            name,
            id: `field-${name}`,
            'data-testid': `field-${name}`
          }}
          disabled={disabled}
          IconComponent={ArrowDown2}
          renderValue={renderValue}
          MenuProps={{
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'center'
            },
            anchorReference: 'anchorEl',
            transformOrigin: {
              vertical: -4,
              horizontal: 'center'
            },
            slotProps: {
              root: {
                sx: {
                  cursor: 'pointer'
                }
              },
              paper: {
                sx: {
                  background: theme.palette.background.default,
                  borderRadius: '0.5rem',
                  boxShadow: `0 4px 16px -1px rgba(0, 0, 0, 0.1)`,

                  '& .MuiList-root': {
                    maxHeight: '11.25rem',
                    padding: theme.spacing(1),
                    overflow: 'hidden auto'
                  },
                  '& .MuiButtonBase-root': {
                    marginBottom: '4px',
                    borderRadius: '6px',

                    '&:last-of-type': {
                      marginBottom: 0
                    },
                    '&:hover': {
                      backgroundColor: opacityColors.button[2]
                    },
                    '&.Mui-focusVisible': {
                      backgroundColor: opacityColors.button[2]
                    },
                    '&.Mui-selected': {
                      backgroundColor: opacityColors.button[4],

                      '&:hover': {
                        backgroundColor: opacityColors.button[2]
                      },
                      '&.Mui-focusVisible': {
                        backgroundColor: opacityColors.button[2]
                      }
                    }
                  }
                }
              }
            }
          }}
          sx={{
            '&&': {
              background: theme.palette.common.white,
              borderRadius: '0.5rem',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.1)'
            },
            '& .MuiSelect-icon': {
              margin: theme.spacing(-0.5, 0.25, 0, 0)
            }
          }}
          variant="outlined"
          {...props}
        >
          {items.map((item) => (
            <MenuItem key={item.value} value={item.value}>
              {typeof renderMenuItem === 'function' && isValidElement(renderMenuItem(item)) ? renderMenuItem(item) : item.name}
            </MenuItem>
          ))}
        </Select>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    </Box>
  )
}
