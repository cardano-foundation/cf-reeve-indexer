import CheckboxMUI from '@mui/material/Checkbox'
import { MinusSquare, Stop, TickSquare } from 'iconsax-react'
import { styled } from 'styled-components'

import type { CheckboxProps } from './checkbox.types'

export const CheckboxStyled = styled(CheckboxMUI)<CheckboxProps>``

export const CheckedIconStyled = styled(() => <TickSquare size={24} variant="Bold" />)(
  ({ theme }) => `
  && {
    color: ${theme.palette.common.black};
  }
`
)

export const IconStyled = styled(() => <Stop size={24} variant="Outline" />)(
  ({ theme }) => `
  && {
    color: ${theme.palette.common.black};
  }
`
)

export const IndeterminateIconStyled = styled(() => <MinusSquare size={24} variant="Bold" />)(
  ({ theme }) => `
  && {
    color: ${theme.palette.common.black};
  }
`
)
