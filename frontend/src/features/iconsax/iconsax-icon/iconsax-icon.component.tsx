import { type IconProps } from 'iconsax-react'

import { ICONSAX_ICONS } from 'features/iconsax/iconsax-icon/iconsax-icon.consts'
import { type IconName } from 'features/iconsax/iconsax-icon/iconsax-icon.types'

interface IconsaxProps extends IconProps {
  name: IconName
}

export const IconsaxIcon = ({ color, name, size, variant, ...props }: IconsaxProps) => {
  const IconComponent = ICONSAX_ICONS[name]

  return <IconComponent color={color} size={size} variant={variant} {...props} />
}
