import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import { Document, TickCircle } from 'iconsax-react'
import { styled } from 'styled-components'

import { FormHelperText } from 'features/mui/base'
import { colors as paletteColors } from 'libs/ui-kit/theme/colors'

interface CardStyledProps {
  $hasError: boolean
}

export const CardStyled = styled(Card)<CardStyledProps>`
  && {
    width: 100%;
    height: 4rem;
    display: flex;
    padding: ${({ theme }) => theme.spacing(0.75, 2)};
    gap: ${({ theme }) => theme.spacing(1)};
    background: ${({ theme }) => theme.palette.background.default};
    border: 1px solid ${({ theme, $hasError }) => ($hasError ? theme.palette.error.main : theme.palette.divider)};
    border-radius: ${({ theme }) => theme.shape.borderRadius * 1.5}px;
    box-shadow: none;
  }
`

export const CardContentStyled = styled(CardContent)`
  && {
    min-width: 0;
    width: 100%;
    height: 3rem;
    display: flex;
    padding: 0;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(2)};
  }
`

export const CardActionsStyled = styled(CardActions)`
  && {
    width: 3rem;
    height: 3rem;
    display: flex;
    padding: 0;
    align-items: center;
    justify-content: center;
  }
`

interface IconStyledProps {
  className?: string
}

export const FileIconStyled = styled(({ className }: IconStyledProps) => <Document className={className} size={24} variant="Outline" />)`
  && {
    flex: 0 0 auto;
    color: ${({ theme }) => theme.palette.action.active};
  }
`

export const CheckIconStyled = styled(({ className }: IconStyledProps) => <TickCircle className={className} size={24} variant="Bold" />)`
  && {
    flex: 0 0 auto;
    color: ${({ theme }) => theme.palette.success.dark};
  }
`

export const FormHelperTextStyled = styled(FormHelperText)`
  && {
    &.Mui-error {
      color: ${paletteColors.red[700]};
    }
  }
`
