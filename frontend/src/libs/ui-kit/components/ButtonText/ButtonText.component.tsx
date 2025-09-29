import { ButtonProps as ButtonPropsMUI } from '@mui/material/Button'
import { styled } from 'styled-components'

import { Button } from 'libs/ui-kit/components/Button/Button.component.tsx'

const ButtonStyled = styled(Button)`
  box-shadow: none;

  &:hover {
    background-color: #000b310a;
  }
` as typeof Button

interface ButtonSecondaryProps extends ButtonPropsMUI {
  to?: string
}

export const ButtonText = ({ children, to, ...props }: ButtonSecondaryProps) => {
  return (
    <ButtonStyled variant="text" to={to} {...props}>
      {children}
    </ButtonStyled>
  )
}
