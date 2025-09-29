import { DateComboboxStyled } from './date-combobox.styles'
import type { DateComboboxProps } from './date-combobox.types'

export const DateCombobox = ({ label, maxDate, minDate, name, textField, value, onChange, disabled, ...props }: DateComboboxProps) => {
  return (
    <DateComboboxStyled
      slotProps={{
        textField: {
          ...textField,
          id: name,
          size: 'small',
          fullWidth: true
        }
      }}
      {...{ label, maxDate, minDate, name, value, onChange, disabled, ...props }}
    />
  )
}
