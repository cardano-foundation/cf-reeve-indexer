import { AlertProps as AlertPropsMUI } from '@mui/material/Alert'
import { Danger, Forbidden2, TickCircle } from 'iconsax-react'

import { AlertStyled } from 'libs/ui-kit/components/Alert/Alert.styles.tsx'

const ICONS = {
  error: Forbidden2,
  // TODO: swap to proper icon when UI starts to use it
  info: Forbidden2,
  success: TickCircle,
  warning: Danger
}

interface AlertProps extends AlertPropsMUI {}

export const Alert = ({ children, icon, severity, variant = 'outlined', ...props }: AlertProps) => {
  const Icon = severity ? ICONS[severity] : ICONS.success

  return (
    <AlertStyled icon={icon ?? <Icon variant="Outline" size={22} />} severity={severity} variant={variant} {...props}>
      {children}
    </AlertStyled>
  )
}
