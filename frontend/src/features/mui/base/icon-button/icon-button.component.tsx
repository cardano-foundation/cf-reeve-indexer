import { forwardRef } from 'react'

import { IconButtonStyled } from './icon-button.styles'
import type { IconButtonProps } from './icon-button.types'

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(({ children, color, size = 'medium', disabled, loading, ...props }, ref) => {
  return <IconButtonStyled {...{ ref, color, size, disabled, loading, ...props }}>{children}</IconButtonStyled>
})

IconButton.displayName = 'IconButton'
