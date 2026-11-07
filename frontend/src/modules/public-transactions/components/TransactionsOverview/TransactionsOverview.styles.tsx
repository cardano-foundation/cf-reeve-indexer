import Box, { BoxProps as BoxPropsMUI } from '@mui/material/Box'
import { styled } from 'styled-components'

export const OverviewStyled = styled(Box)<BoxPropsMUI>`
  && {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: ${({ theme }) => theme.spacing(2)};
    margin: 0;

    ${({ theme }) => theme.breakpoints.down('md')} {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
`

export const OverviewItemStyled = styled(Box)`
  && {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(0.5)};
    padding: ${({ theme }) => theme.spacing(1.5, 2)};
    background: ${({ theme }) => theme.palette.background.default};
    border: 1px solid ${({ theme }) => theme.palette.divider};
    border-radius: ${({ theme }) => theme.spacing(1)};
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);

    & > dd {
      margin: 0;
    }
  }
`
