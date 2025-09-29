import { DatePicker as DatePickerMUI } from '@mui/x-date-pickers/DatePicker'
import { ArrowCircleLeft, ArrowCircleRight, ArrowDown2, Calendar1 } from 'iconsax-react'
import { styled } from 'styled-components'

import type { DatePickerStyledProps } from './date-picker.types'

export const DatePickerStyled = styled(DatePickerMUI)<DatePickerStyledProps>(
  ({ theme }) => `
  && {
    & .MuiInputBase-root {
      background: ${theme.palette.background.default};
      border-radius: ${theme.shape.borderRadius * 2}px;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
    }
  }
`
)

export const OpenPickerIconStyled = styled(() => <Calendar1 size={24} variant="Outline" />)(
  ({ theme }) => `
  && {
    color: ${theme.palette.action.active};
  }
`
)

export const LeftArrowIconStyled = styled(() => <ArrowCircleLeft size={24} variant="Outline" />)(
  ({ theme }) => `
  && {
    color: ${theme.palette.action.active};
  }
`
)

export const RightArrowIconStyled = styled(() => <ArrowCircleRight size={24} variant="Outline" />)(
  ({ theme }) => `
  && {
    color: ${theme.palette.action.active};
  }
`
)

export const SwitchViewIconStyled = styled(() => <ArrowDown2 size={16} variant="Outline" />)(
  ({ theme }) => `
  && {
    color: ${theme.palette.action.active};
  }
`
)
