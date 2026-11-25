import Box, { BoxProps as BoxPropsMUI } from '@mui/material/Box'
import { styled } from 'styled-components'

export const LANDING_CARD_SHADOW = '0 1px 2px 0 rgba(0, 0, 0, 0.06), 0 8px 24px 0 rgba(0, 0, 0, 0.06)'

export const LandingSectionStyled = styled(Box)<BoxPropsMUI>`
  && {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(2)};
    min-width: 0;
    padding: ${({ theme }) => theme.spacing(3)};
    background: ${({ theme }) => theme.palette.common.white};
    border: 1px solid ${({ theme }) => theme.palette.divider};
    border-radius: ${({ theme }) => theme.spacing(1)};
    box-shadow: ${LANDING_CARD_SHADOW};

    ${({ theme }) => theme.breakpoints.down('sm')} {
      padding: ${({ theme }) => theme.spacing(2)};
    }
  }
`
