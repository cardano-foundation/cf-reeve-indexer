import { forwardRef } from 'react'

import { ChipStyled } from './chip.styles'
import type { ChipProps } from './chip.types'

export const Chip = forwardRef<HTMLDivElement, ChipProps>(({ color = 'default', label, size = 'small', variant = 'outlined', ...props }, ref) => {
  return <ChipStyled {...{ color, label, ref, size, variant, ...props }} />
})

Chip.displayName = 'Chip'
