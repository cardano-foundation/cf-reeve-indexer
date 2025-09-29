import TextFieldMUI from '@mui/material/TextField'
import { styled } from 'styled-components'

import type { TextFieldProps } from './text-field.types'

export const TextFieldStyled = styled(TextFieldMUI)<TextFieldProps>(
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
