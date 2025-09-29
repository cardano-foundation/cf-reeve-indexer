import { IconStyled, SelectStyled } from './select.styles'
import type { SelectProps } from './select.types'

export const Select = ({
  label,
  MenuProps,
  name,
  size = 'small',
  value,
  variant = 'outlined',
  onChange,
  renderValue,
  disabled,
  error = false,
  required = false,
  ...props
}: SelectProps) => {
  return (
    <SelectStyled
      inputProps={{
        id: name,
        name
      }}
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
        ...MenuProps
      }}
      IconComponent={IconStyled}
      {...{ label, name, size, value, variant, onChange, renderValue, disabled, error, required, ...props }}
    />
  )
}
