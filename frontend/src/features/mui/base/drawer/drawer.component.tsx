import { DrawerStyled } from './drawer.styles'
import type { DrawerProps } from './drawer.types'

export const Drawer = ({ anchor, component, variant, open, ...props }: DrawerProps) => {
  return <DrawerStyled {...{ anchor, component, variant, open, ...props }} />
}
