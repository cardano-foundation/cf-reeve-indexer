import { forwardRef } from 'react'

import { WatermarkStyled } from './watermark.styles'
import type { WatermarkProps } from './watermark.types'

export const Watermark = forwardRef<HTMLDivElement, WatermarkProps>(({ children, ...props }, ref) => {
  return (
    <WatermarkStyled ref={ref} {...props}>
      {children}
    </WatermarkStyled>
  )
})

Watermark.displayName = 'Watermark'
