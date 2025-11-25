import { DatePicker as DatePickerMUI } from '@mui/x-date-pickers/DatePicker'
import { ArrowCircleLeft, ArrowCircleRight, ArrowDown2, Calendar1 } from 'iconsax-react'
import { styled } from 'styled-components'

import type { DatePickerStyledProps } from './date-picker.types'

export const DatePickerStyled = styled(DatePickerMUI)<DatePickerStyledProps>(
  ({ theme }) => `
  && {
    & .MuiInputBase-root {
      background: ${theme.palette.background.default};
      border-radius: ${Number(theme.shape.borderRadius) * 2}px;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
    }

    & .MuiInputLabel-root,
    & .MuiInputLabel-asterisk,
    & .MuiFormHelperText-root {
      &.Mui-error {
        color: ${theme.palette.error.dark};
      }
    }
  }
`
)

export const OpenPickerIconStyled = styled(() => <Calendar1 color="currentColor" size={24} variant="Outline" />)(
  ({ theme }) => `
  && {
    color: ${theme.palette.action.active};
  }
`
)

export const LeftArrowIconStyled = styled(() => <ArrowCircleLeft color="currentColor" size={24} variant="Outline" />)(
  ({ theme }) => `
  && {
    color: ${theme.palette.action.active};
  }
`
)

export const RightArrowIconStyled = styled(() => <ArrowCircleRight color="currentColor" size={24} variant="Outline" />)(
  ({ theme }) => `
  && {
    color: ${theme.palette.action.active};
  }
`
)

export const SwitchViewIconStyled = styled(() => <ArrowDown2 color="currentColor" size={16} variant="Outline" />)(
  ({ theme }) => `
  && {
    color: ${theme.palette.action.active};
  }
`
)
