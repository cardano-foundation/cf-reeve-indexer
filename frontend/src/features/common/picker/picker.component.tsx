import { FormControl, FormHelperText, InputLabel } from 'features/mui/base'

import { ListboxStyled, MenuItemStyled, PickerStyled } from './picker.styles'
import type { PickerProps } from './picker.types'

export const Picker = ({ helperText, label, name, options, disabled, error, required, ...props }: PickerProps) => {
  return (
    <FormControl {...{ disabled, error, required }}>
      <InputLabel id="select" htmlFor={name}>
        {label}
      </InputLabel>
      <PickerStyled
        labelId="select"
        MenuProps={{
          slotProps: {
            paper: {
              sx: (theme) => ({
                background: theme.palette.background.default,
                borderRadius: `${theme.shape.borderRadius * 2}px`,
                boxShadow: '0 4px 16px -1px rgba(0, 0, 0, 0.1)'
              })
            }
          },
          slots: {
            list: ListboxStyled
          }
        }}
        {...{ label, disabled, error, required, ...props }}
      >
        {options.map(({ label, value }) => (
          <MenuItemStyled key={value} value={value}>
            {label}
          </MenuItemStyled>
        ))}
      </PickerStyled>
      {helperText && <FormHelperText {...{ disabled, error, required }}>{helperText}</FormHelperText>}
    </FormControl>
  )
}
