import { ChipProps as ChipPropsMUI } from '@mui/material/Chip'
import { forwardRef } from 'react'

import { ChipStyled } from 'libs/ui-kit/components/Chip/Chip.styles.tsx'

interface ChipProps extends ChipPropsMUI {}

export const Chip = forwardRef<HTMLDivElement, ChipProps>(({ color = 'default', label, variant = 'outlined', ...props }, ref) => {
  return <ChipStyled color={color} label={label} size="small" variant={variant} ref={ref} {...props} />
})

Chip.displayName = 'Chip'
