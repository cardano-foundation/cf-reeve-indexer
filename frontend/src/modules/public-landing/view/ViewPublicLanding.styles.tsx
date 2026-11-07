import Box, { BoxProps as BoxPropsMUI } from '@mui/material/Box'
import Link from '@mui/material/Link'
import { createGlobalStyle, css, styled } from 'styled-components'

import { colors } from 'libs/ui-kit/theme/colors.ts'
import { MOTION_SAFE, rise } from 'modules/public-landing/utils/animations.ts'

export const LandingGlobalStyle = createGlobalStyle`
  html body {
    background-color: ${({ theme }) => theme.palette.common.white};
  }
`

export const SkipLinkStyled = styled(Link)`
  && {
    position: fixed;
    top: ${({ theme }) => theme.spacing(1)};
    left: ${({ theme }) => theme.spacing(1)};
    z-index: ${({ theme }) => theme.zIndex.tooltip};
    padding: ${({ theme }) => theme.spacing(1, 2)};
    border-radius: ${({ theme }) => theme.spacing(1)};
    background: ${({ theme }) => theme.palette.primary.main};
    color: ${({ theme }) => theme.palette.primary.contrastText};
    font-weight: 600;
    transform: translateY(-200%);

    &:focus {
      transform: none;
    }
  }
`

export const LandingStyled = styled(Box)`
  && {
    --landing-header-height: 4.5rem;

    display: flex;
    flex-direction: column;
    min-height: 100%;
    background: ${({ theme }) => theme.palette.common.white};

    ${({ theme }) => theme.breakpoints.down('sm')} {
      background: ${colors.neutral[50]};
    }
  }
`

export const MainStyled = styled(Box)<BoxPropsMUI>`
  && {
    display: flex;
    flex: 1 0 auto;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(3)};
    width: 100%;
    max-width: calc(66rem + ${({ theme }) => theme.spacing(12)});
    margin: ${({ theme }) => theme.spacing(-8)} auto 0;
    padding: ${({ theme }) => theme.spacing(0, 6, 6)};
    outline: none;

    ${({ theme }) => theme.breakpoints.down('sm')} {
      margin-top: 0;
      padding: ${({ theme }) => theme.spacing(2, 2, 4)};
      gap: ${({ theme }) => theme.spacing(2)};
    }

    ${MOTION_SAFE} {
      & > :nth-child(2) {
        animation: ${rise} 0.7s 0.8s ease both;
      }

      & > :nth-child(3) {
        animation: ${rise} 0.7s 0.95s ease both;
      }

      & > :nth-child(4) {
        animation: ${rise} 0.7s 1.1s ease both;
      }
    }
  }
`

interface TopGridStyledProps {
  $isSplit: boolean
  $isPartnerAnimated: boolean
}

export const TopGridStyled = styled(Box)<TopGridStyledProps>`
  && {
    display: grid;
    grid-template-columns: ${({ $isSplit }) => ($isSplit ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1fr)')};
    gap: ${({ theme }) => theme.spacing(3)};

    ${MOTION_SAFE} {
      & > :nth-child(1) {
        animation: ${rise} 0.7s 0.5s ease both;
      }

      & > :nth-child(2) {
        animation: ${({ $isPartnerAnimated }) =>
          $isPartnerAnimated
            ? css`
                ${rise} 0.7s 0.65s ease both
              `
            : 'none'};
      }
    }

    ${({ theme }) => theme.breakpoints.down('smw')} {
      grid-template-columns: minmax(0, 1fr);
      gap: ${({ theme }) => theme.spacing(2)};
    }
  }
`
