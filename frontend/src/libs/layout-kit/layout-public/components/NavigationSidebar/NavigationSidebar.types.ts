import { Icon } from 'iconsax-react'

export interface MenuItem {
  icon: Icon
  label: string
  route: string
  isActive?: () => boolean
  hasViewTransition?: boolean
}
