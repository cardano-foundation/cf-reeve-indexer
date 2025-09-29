import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import { styled } from 'styled-components'

import { sizeMap } from 'modules/dashboard-tool/constants/card.ts'

interface CardStyledProps {
  $size?: 'small' | 'medium' | 'large'
}

export const CardStyled = styled(Card)<CardStyledProps>`
  && {
    display: flex;
    min-height: ${({ $size }) => ($size ? sizeMap[$size] : '100%')};
    width: 100%;
    height: 100%;
    flex-flow: column nowrap;
    background: ${({ theme }) => theme.palette.background.default};
    border: 1px solid ${({ theme }) => theme.palette.divider};
    border-radius: ${({ theme }) => `${theme.shape.borderRadius * 2}px`};
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);

    ${({ theme, $size }) => `
      ${theme.breakpoints.down('xl')} {
        min-height: initial;
        height: ${$size ? sizeMap[$size] : '100%'};
      }
    `}
  }
`

export const CardHeaderStyled = styled(CardHeader)`
  && {
    height: 3.75rem;
    padding: ${({ theme }) => theme.spacing(1, 1, 1, 2)};

    & .MuiCardHeader-action {
      margin: 0;
    }
  }
`

export const IconButtonStyled = styled(IconButton)`
  && {
    width: 2.75rem;
    height: 2.75rem;
  }
`

export const CardContentStyled = styled(CardContent)`
  && {
    display: flex;
    min-height: 0;
    width: 100%;
    padding: ${({ theme }) => theme.spacing(2)};
    flex: 1 0 auto;
    flex-flow: column nowrap;
    justify-content: center;

    &:last-child {
      padding: ${({ theme }) => theme.spacing(2)};
    }
  }
`
