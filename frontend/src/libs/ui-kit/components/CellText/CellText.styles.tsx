import Typography, { TypographyProps as TypographyMUIProps } from '@mui/material/Typography'
import { styled } from 'styled-components'

interface CellTextStyledProps extends TypographyMUIProps {
  $isTextWrapped?: boolean
}

export const CellTextStyled = styled(Typography)<CellTextStyledProps>`
  && {
    ${({ $isTextWrapped }) =>
      $isTextWrapped
        ? `
        white-space: pre-wrap;
      `
        : `
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      `}
  }
`
