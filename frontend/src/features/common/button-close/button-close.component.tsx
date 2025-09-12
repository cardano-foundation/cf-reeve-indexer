import { forwardRef } from 'react'

import { ButtonCloseStyled, CloseIconStyled } from './button-close.styles'
import type { ButtonCloseProps } from './button-close.types'

export const ButtonClose = forwardRef<HTMLButtonElement, ButtonCloseProps>(({ children, ...props }, ref) => {
  return (
    <ButtonCloseStyled {...{ ref, ...props }}>
      <CloseIconStyled />
    </ButtonCloseStyled>
  )
})

ButtonClose.displayName = 'ButtonClose'
