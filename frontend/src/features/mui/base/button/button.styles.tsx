import ButtonMUI from '@mui/material/Button'
import { styled } from 'styled-components'

import type { ButtonProps } from './button.types'

export const ButtonStyled = styled(ButtonMUI)<ButtonProps>(
  ({ theme }) => `
  && {
    border-radius: ${theme.shape.borderRadius * 2}px;
    text-transform: none;
    text-wrap: nowrap;
  }
`
)
