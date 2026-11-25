import Box, { BoxProps as BoxPropsMUI } from '@mui/material/Box'
import { styled } from 'styled-components'

import { LANDING_CARD_SHADOW } from 'modules/public-landing/components/LandingSection/LandingSection.styles.tsx'

export const GetStartedStyled = styled(Box)<BoxPropsMUI>`
  && {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${({ theme }) => theme.spacing(2)};
    padding: ${({ theme }) => theme.spacing(1.5, 2.5)};
    background: ${({ theme }) => theme.palette.common.white};
    border: 1px solid ${({ theme }) => theme.palette.divider};
    border-radius: ${({ theme }) => theme.spacing(1)};
    box-shadow: ${LANDING_CARD_SHADOW};

    ${({ theme }) => theme.breakpoints.down('sm')} {
      flex-direction: column;
      align-items: stretch;
      padding: ${({ theme }) => theme.spacing(2)};
    }
  }
`
