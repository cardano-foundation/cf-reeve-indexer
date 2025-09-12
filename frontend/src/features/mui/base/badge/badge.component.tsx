import { forwardRef } from 'react'

import { BadgeStyled } from './badge.styles'
import type { BadgeProps } from './badge.types'

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ anchorOrigin = { horizontal: 'right', vertical: 'top' }, badgeContent, children, color = 'default', overlap = 'rectangular', variant = 'standard', ...props }, ref) => {
    return (
      <BadgeStyled
        {...{
          anchorOrigin,
          badgeContent,
          color,
          overlap,
          ref,
          variant,
          ...props
        }}
      >
        {children}
      </BadgeStyled>
    )
  }
)

Badge.displayName = 'Badge'
