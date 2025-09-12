import Card, { CardProps } from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import { styled } from 'styled-components'

interface CardStyledProps extends CardProps {
  $background: string
}

export const CardStyled = styled(Card)<CardStyledProps>`
  && {
    width: 100%;
    height: 13.25rem;
    background: ${({ $background }) => $background};
    border: 1px solid ${({ theme }) => theme.palette.divider};
    border-radius: ${({ theme }) => `${theme.shape.borderRadius * 2}px`};
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
    transform: translateY(0);
    transition: all 0.3s ease;

    &:hover {
      background: ${({ theme }) => theme.palette.common.white};
      transform: translateY(-4px);
      // Target IconWrapper inside on hover
      .icon-wrapper {
        background: ${({ $background }) => $background};
        transform: rotate(-5deg) scale(1.1);
        transition:
          background 0.4s ease,
          transform 0.3s ease;
        svg {
          color: #fff;
        }
      }
    }
  }
`

export const CardActionAreaStyled = styled(CardActionArea)`
  && {
    height: 100%;
  }
` as typeof CardActionArea

export const CardContentStyled = styled(CardContent)`
  && {
    height: 100%;
    display: flex;
    flex-flow: column nowrap;
    padding: ${({ theme }) => theme.spacing(3)};
    gap: ${({ theme }) => theme.spacing(1)};
    justify-content: space-between;
  }
`

export const IconWrapperStyled = styled.div`
  && {
    width: 4rem;
    height: 4rem;
    border-radius: 50%;
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    background: ${({ theme }) => theme.palette.common.white};
  }
`
