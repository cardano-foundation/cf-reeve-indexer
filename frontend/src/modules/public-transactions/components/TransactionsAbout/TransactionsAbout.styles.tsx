import Box, { BoxProps as BoxPropsMUI } from '@mui/material/Box'
import { styled } from 'styled-components'

export const AboutStyled = styled(Box)<BoxPropsMUI>`
  && {
    background: transparent;
    border: 1px solid ${({ theme }) => theme.palette.divider};
    border-radius: ${({ theme }) => theme.spacing(1)};
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
  }
`

export const AboutHeaderStyled = styled(Box)`
  && {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${({ theme }) => theme.spacing(2)};
    padding: ${({ theme }) => theme.spacing(1, 1, 1, 2)};
  }
`

export const AboutContentStyled = styled(Box)`
  && {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: ${({ theme }) => theme.spacing(3)};
    padding: ${({ theme }) => theme.spacing(0, 2, 2)};

    ${({ theme }) => theme.breakpoints.down('md')} {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    ${({ theme }) => theme.breakpoints.down('sm')} {
      grid-template-columns: minmax(0, 1fr);
    }
  }
`
