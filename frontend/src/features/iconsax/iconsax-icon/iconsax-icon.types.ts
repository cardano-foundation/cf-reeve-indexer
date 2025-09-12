import { type IconProps } from 'iconsax-react'
import { type FC } from 'react'

import { ICONSAX_NAMES } from 'features/iconsax/iconsax-icon/iconsax-icon.consts'

export type IconName = keyof typeof ICONSAX_NAMES

export type Icon = FC<IconProps>
