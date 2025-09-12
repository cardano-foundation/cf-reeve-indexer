import { DrawerProps } from 'features/mui/base'
import { useMediaQueries } from 'hooks'
import { DrawerContent } from 'libs/layout-kit/components/DrawerContent/DrawerContent.component.tsx'
import { DrawerFooter } from 'libs/layout-kit/components/DrawerFooter/DrawerFooter.component.tsx'
import { DrawerHeader } from 'libs/layout-kit/components/DrawerHeader/DrawerHeader.component.tsx'
import { LayoutContentDrawerStyled } from 'libs/layout-kit/sections/LayoutContentDrawer/LayoutContentDrawer.styles.tsx'
import { Dialog } from 'libs/ui-kit/components/Dialog/Dialog.component.tsx'

interface LayoutContentDrawerProps extends DrawerProps {
  open: NonNullable<boolean>
}

export const LayoutContentDrawer = ({ children, open, ...props }: LayoutContentDrawerProps) => {
  const { isMobile } = useMediaQueries()

  if (isMobile) {
    return (
      <Dialog aria-label="dialog-alert-title" maxWidth="sm" open={open} fullWidth>
        {children}
      </Dialog>
    )
  }

  return (
    <LayoutContentDrawerStyled anchor="right" variant="persistent" open={open} {...props}>
      {children}
    </LayoutContentDrawerStyled>
  )
}

LayoutContentDrawer.Content = DrawerContent
LayoutContentDrawer.Footer = DrawerFooter
LayoutContentDrawer.Header = DrawerHeader
