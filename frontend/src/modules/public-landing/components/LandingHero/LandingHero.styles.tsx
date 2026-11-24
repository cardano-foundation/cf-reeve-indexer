import Box, { BoxProps as BoxPropsMUI } from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { styled } from 'styled-components'

import { colors } from 'libs/ui-kit/theme/colors.ts'
import { grow, MOTION_SAFE, pop, POP_EASING, rise } from 'modules/public-landing/utils/animations.ts'

export const HeroStyled = styled(Box)<BoxPropsMUI>`
  && {
    padding: ${({ theme }) => theme.spacing(9, 6, 17)};
    background: ${colors.neutral[50]};

    ${({ theme }) => theme.breakpoints.down('sm')} {
      display: flex;
      min-height: calc(100vh - var(--landing-header-height));
      min-height: calc(100svh - var(--landing-header-height));
      padding: ${({ theme }) => theme.spacing(3, 2, 4)};
    }
  }
`

export const HeroInnerStyled = styled(Box)`
  && {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
    align-items: center;
    gap: ${({ theme }) => theme.spacing(6)};
    max-width: 66rem;
    margin: 0 auto;

    ${({ theme }) => theme.breakpoints.down('smw')} {
      grid-template-columns: minmax(0, 1fr);
      gap: ${({ theme }) => theme.spacing(3)};
    }

    ${({ theme }) => theme.breakpoints.down('sm')} {
      flex: 1;
      grid-template-rows: auto 1fr auto;
      width: 100%;
    }
  }
`

export const HeroTitleStyled = styled(Typography)`
  && {
    font-size: 4.5rem;
    font-weight: 700;
    line-height: 1.05;
    letter-spacing: -0.025em;

    ${({ theme }) => theme.breakpoints.down('sm')} {
      font-size: clamp(2.5rem, 12vw, 3rem);
    }

    ${MOTION_SAFE} {
      animation: ${rise} 0.6s ease both;
    }
  }
`

export const HeroClaimStyled = styled(Typography)`
  && {
    margin-top: ${({ theme }) => theme.spacing(2)};
    font-size: 1.5rem;
    font-weight: 500;
    line-height: 1.3;

    ${({ theme }) => theme.breakpoints.down('sm')} {
      margin-top: ${({ theme }) => theme.spacing(1)};
      font-size: 1.25rem;
    }

    ${MOTION_SAFE} {
      animation: ${rise} 0.6s 0.1s ease both;
    }
  }
`

export const HeroNoteStyled = styled(Typography)`
  && {
    margin-top: ${({ theme }) => theme.spacing(1.5)};

    ${MOTION_SAFE} {
      animation: ${rise} 0.6s 0.2s ease both;
    }
  }
`

export const StepsStyled = styled.ol`
  && {
    --step-size: 3.5rem;
    --step-gap: ${({ theme }) => theme.spacing(2.5)};

    display: flex;
    flex-direction: column;
    gap: var(--step-gap);
    margin: 0;
    padding: 0;
    list-style: none;

    ${({ theme }) => theme.breakpoints.down('sm')} {
      --step-size: clamp(2.75rem, 8svh, 3.5rem);
      --step-gap: clamp(14px, 5svh, 48px);

      justify-self: center;
      width: fit-content;
      max-width: 100%;
    }
  }
`

interface StepStyledProps {
  $index: number
}

export const StepStyled = styled.li<StepStyledProps>`
  && {
    position: relative;
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(2)};

    &:not(:last-child)::after {
      content: '';
      position: absolute;
      top: var(--step-size);
      left: calc(var(--step-size) / 2 - 1px);
      width: 2px;
      height: var(--step-gap);
      background: ${colors.neutral[300]};
      transform-origin: top;
    }

    ${MOTION_SAFE} {
      &::after {
        animation: ${grow} 0.3s ${({ $index }) => 0.6 + $index * 0.5}s ease both;
      }

      & > :last-child {
        animation: ${rise} 0.5s ${({ $index }) => 0.4 + $index * 0.5}s ease both;
      }
    }
  }
`

interface StepIconStyledProps {
  $background: string
  $index: number
}

export const StepIconStyled = styled.span<StepIconStyledProps>`
  && {
    position: relative;
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: var(--step-size);
    height: var(--step-size);
    border-radius: 50%;
    background: ${({ $background }) => $background};

    ${MOTION_SAFE} {
      animation: ${pop} 0.4s ${({ $index }) => 0.3 + $index * 0.5}s ${POP_EASING} both;
    }
  }
`

export const StepNumberStyled = styled.span`
  && {
    position: absolute;
    right: -4px;
    bottom: -4px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.375rem;
    height: 1.375rem;
    border-radius: 50%;
    background: ${({ theme }) => theme.palette.primary.main};
    color: ${({ theme }) => theme.palette.primary.contrastText};
    font-size: 0.75rem;
    font-weight: 600;
  }
`
