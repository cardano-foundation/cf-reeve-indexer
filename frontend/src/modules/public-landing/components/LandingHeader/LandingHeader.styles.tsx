import Box, { BoxProps as BoxPropsMUI } from '@mui/material/Box'
import { styled } from 'styled-components'

export const LandingHeaderStyled = styled(Box)<BoxPropsMUI>`
  && {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${({ theme }) => theme.spacing(2)};
    padding: ${({ theme }) => theme.spacing(3, 6)};
    background: ${({ theme }) => theme.palette.common.white};
    border-bottom: 1px solid ${({ theme }) => theme.palette.divider};

    ${({ theme }) => theme.breakpoints.down('sm')} {
      box-sizing: border-box;
      min-height: var(--landing-header-height);
      padding: ${({ theme }) => theme.spacing(0, 2)};
    }
  }
`

export const LogoStyled = styled(Box)`
  && {
    display: flex;
    width: 6.75rem;
    align-items: center;

    & svg {
      width: 100%;
    }
  }
`
