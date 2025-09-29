import { useTheme } from '@mui/material'
import { DatePicker, DatePickerProps } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import { ArrowCircleLeft, ArrowCircleRight, ArrowDown2, Calendar } from 'iconsax-react'

const ArrowDown = () => <ArrowDown2 size={16} />

export interface InputDatePickerProps extends DatePickerProps<dayjs.Dayjs> {
  id?: string
  error?: boolean
  helperText?: string
}

export const InputDatePicker = ({ value, onChange, minDate, maxDate, label, name, id, error, helperText, disabled }: InputDatePickerProps) => {
  const theme = useTheme()

  return (
    <DatePicker
      name={name}
      label={label}
      format="DD/MM/YYYY"
      minDate={minDate}
      maxDate={maxDate}
      value={value}
      onChange={onChange}
      slots={{
        openPickerIcon: () => <Calendar />,
        leftArrowIcon: () => <ArrowCircleLeft />,
        rightArrowIcon: () => <ArrowCircleRight />,
        switchViewIcon: () => <ArrowDown />
      }}
      slotProps={{
        day: {
          sx: {
            borderRadius: '0.5rem'
          }
        },
        desktopPaper: {
          sx: {
            background: theme.palette.common.white,
            borderRadius: '0.5rem',
            boxShadow: '0 4px 16px -1px rgba(0, 0, 0, 0.1)'
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
        textField: {
          size: 'small',
          id,
          error,
          helperText,
          fullWidth: true
        }
      }}
      sx={{
        '.MuiInputBase-root': {
          background: theme.palette.common.white,
          borderRadius: '0.5rem',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.1)'
        }
      }}
      disabled={disabled}
    />
  )
}
