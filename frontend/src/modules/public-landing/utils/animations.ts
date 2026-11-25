import { keyframes } from 'styled-components'

export const rise = keyframes`
  from {
    opacity: 0;
    transform: translateY(24px);
  }
`

export const pop = keyframes`
  from {
    opacity: 0;
    transform: scale(0.6);
  }
`

export const grow = keyframes`
  from {
    transform: scaleY(0);
  }
`

export const MOTION_SAFE = '@media (prefers-reduced-motion: no-preference)'

export const HOVER_CAPABLE = '@media (hover: hover)'

export const POP_EASING = 'cubic-bezier(0.3, 1.4, 0.6, 1)'
