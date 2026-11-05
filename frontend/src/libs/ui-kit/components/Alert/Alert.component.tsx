import { AlertProps as AlertPropsMUI } from '@mui/material/Alert'
import { Danger, Forbidden2, InfoCircle, TickCircle } from 'iconsax-react'

import { AlertStyled } from 'libs/ui-kit/components/Alert/Alert.styles.tsx'

const ICONS = {
  error: Forbidden2,
  // An informational note is NOT an error — use a neutral info glyph, never the red Forbidden2 mark.
  info: InfoCircle,
  success: TickCircle,
  warning: Danger
}

interface AlertProps extends AlertPropsMUI {}

export const Alert = ({ children, icon, severity, variant = 'outlined', ...props }: AlertProps) => {
  const Icon = severity ? ICONS[severity] : ICONS.success

  return (
    <AlertStyled icon={icon ?? <Icon variant={severity === 'error' ? 'Bold' : 'Outline'} size={22} />} severity={severity} variant={variant} {...props}>
      {children}
    </AlertStyled>
  )
}
