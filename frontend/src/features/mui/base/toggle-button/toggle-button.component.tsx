import { forwardRef } from 'react'

import { ToggleButtonStyled } from './toggle-button.styles'
import type { ToggleButtonProps } from './toggle-button.types'

export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(({ children, size = 'small', value, onClick, disabled, selected, ...props }, ref) => {
  return <ToggleButtonStyled {...{ ref, size, value, onClick, disabled, selected, ...props }}>{children}</ToggleButtonStyled>
})

ToggleButton.displayName = 'ToggleButton'
