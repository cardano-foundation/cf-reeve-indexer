import Box, { BoxProps as BoxPropsMUI } from '@mui/material/Box'
import { styled } from 'styled-components'

export const DataGridContainerStyled = styled(Box)<BoxPropsMUI>`
  && {
    background: ${({ theme }) => theme.palette.background.default};
    border: ${({ theme }) => `1px solid ${theme.palette.divider}`};
    border-radius: ${({ theme }) => `${theme.shape.borderRadius * 2}px`};
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
  }
`

export const DataGridHeaderStyled = styled(Box)<BoxPropsMUI>`
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.palette.background.default};
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
`
