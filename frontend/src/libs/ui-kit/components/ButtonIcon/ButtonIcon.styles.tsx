import IconButton, { IconButtonProps as IconButtonPropsMUI } from '@mui/material/IconButton'
import { styled } from 'styled-components'

interface ButtonIconStyledProps extends IconButtonPropsMUI {
  $variant?: 'default' | 'outlined'
}

export const ButtonIconStyled = styled(IconButton)<ButtonIconStyledProps>`
  && {
    padding: ${({ theme, $variant }) => ($variant === 'outlined' ? theme.spacing(0.875) : theme.spacing(1))};
    border: ${({ theme, $variant }) => ($variant === 'outlined' ? `1px solid ${theme.palette.divider}` : 'initial')};
    border-radius: ${({ theme, $variant }) => ($variant === 'outlined' ? `${theme.shape.borderRadius * 2}px` : '50%')};

    & .MuiTouchRipple-child {
      border-radius: ${({ $variant }) => ($variant === 'outlined' ? 'inherit' : '50%')};
    }
  }
`
