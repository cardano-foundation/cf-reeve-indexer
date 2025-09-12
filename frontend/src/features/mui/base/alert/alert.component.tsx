import { ICONSAX_NAMES, IconsaxIcon } from 'features/iconsax'

import { AlertStyled } from './alert.styles'
import type { AlertProps } from './alert.types'

export const ICON_MAPPING = {
  error: <IconsaxIcon name={ICONSAX_NAMES.FORBIDDEN2} size={22} variant="Outline" />,
  // TODO: swap to proper icon when UI starts to use it
  info: <IconsaxIcon name={ICONSAX_NAMES.FORBIDDEN2} size={22} variant="Outline" />,
  success: <IconsaxIcon name={ICONSAX_NAMES.TICK_CIRCLE} size={22} variant="Outline" />,
  warning: <IconsaxIcon name={ICONSAX_NAMES.DANGER} size={22} variant="Outline" />
}

export const Alert = ({ children, color, severity, variant = 'outlined', ...props }: AlertProps) => {
  return (
    <AlertStyled iconMapping={ICON_MAPPING} {...{ color, severity, variant, ...props }}>
      {children}
    </AlertStyled>
  )
}
