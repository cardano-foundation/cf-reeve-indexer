import { DatePickerStyled, LeftArrowIconStyled, OpenPickerIconStyled, RightArrowIconStyled, SwitchViewIconStyled } from './date-picker.styles'
import type { DatePickerProps } from './date-picker.types'

export const DatePicker = ({ label, maxDate, minDate, name, slotProps, value, onChange, disabled, ...props }: DatePickerProps) => {
  return (
    <DatePickerStyled
      format="DD/MM/YYYY"
      slotProps={{
        day: { sx: (theme) => ({ borderRadius: `${Number(theme.shape.borderRadius) * 2}px` }), ...slotProps?.day },
        desktopPaper: {
          sx: (theme) => ({
            background: theme.palette.background.default,
            borderRadius: `${Number(theme.shape.borderRadius) * 2}px`,
            boxShadow: '0 4px 16px -1px rgba(0, 0, 0, 0.1)'
          }),
          ...slotProps?.desktopPaper
        },
        field: { clearable: true, ...slotProps?.field },
        mobilePaper: {
          sx: (theme) => ({
            background: theme.palette.background.default,
            borderRadius: `${Number(theme.shape.borderRadius) * 2}px`,
            boxShadow: '0 4px 16px -1px rgba(0, 0, 0, 0.1)'
          }),
          ...slotProps?.mobilePaper
        },
        popper: {
          modifiers: [{ name: 'offset', options: { offset: [0, 4] } }],
          ...slotProps?.popper
        },
        ...slotProps
      }}
      slots={{
        openPickerIcon: OpenPickerIconStyled,
        leftArrowIcon: LeftArrowIconStyled,
        rightArrowIcon: RightArrowIconStyled,
        switchViewIcon: SwitchViewIconStyled
      }}
      {...{ label, maxDate, minDate, name, value, onChange, disabled, ...props }}
    />
  )
}
