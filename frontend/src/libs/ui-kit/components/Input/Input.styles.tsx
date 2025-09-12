import TextField from '@mui/material/TextField'
import { styled } from 'styled-components'

import { colors as paletteColors } from 'libs/ui-kit/theme/colors.ts'

export const InputStyled = styled(TextField)<{ inputRef?: React.RefObject<HTMLInputElement> }>`
  && {
    & .MuiInputBase-root {
      background: ${({ theme }) => theme.palette.common.white};
      border-radius: ${({ theme }) => `${theme.shape.borderRadius * 2}px`};
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
    }

    ${({ inputRef }) =>
      inputRef?.current?.readOnly &&
      `
        & .MuiOutlinedInput-notchedOutline {
          border-color: ${paletteColors.neutral[200]};
        }
        
        &:hover .MuiOutlinedInput-notchedOutline {
          border-color: ${paletteColors.neutral[200]};
        }
        
        & .Mui-focused .MuiOutlinedInput-notchedOutline {
          border-color: ${paletteColors.neutral[200]};
          border-width: 1px;
        }
      `}
  }
`
