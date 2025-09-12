import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import FormHelperText from '@mui/material/FormHelperText'
import { Danger, Document, TickCircle } from 'iconsax-react'
import { styled } from 'styled-components'

export const CardStyled = styled(Card)`
  && {
    width: 100%;
    height: 4rem;
    display: flex;
    padding: ${({ theme }) => theme.spacing(0.75, 2)};
    gap: ${({ theme }) => theme.spacing(1)};
    background: ${({ theme }) => theme.palette.background.default};
    border: 1px solid ${({ theme }) => theme.palette.divider};
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

export const FormHelperTextStyled = styled(FormHelperText)`
  && {
    margin: ${({ theme }) => theme.spacing(0.375, 1.75, 0, 1.75)};
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

export const DangerIconStyled = styled(({ className }: IconStyledProps) => <Danger className={className} size={24} variant="Bold" />)`
  && {
    flex: 0 0 auto;
    color: ${({ theme }) => theme.palette.error.dark};
  }
`
