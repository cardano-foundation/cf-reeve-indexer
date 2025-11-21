import { useMediaQuery, useTheme } from '@mui/material'
import { Outlet } from 'react-router-dom'

import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext.ts'
import { LayoutContent } from 'libs/layout-kit/sections/LayoutContent/LayoutContent.component.tsx'
import { LayoutFooter } from 'libs/layout-kit/sections/LayoutFooter/LayoutFooter.component.tsx'

export const LayoutPublicContent = () => {
  const theme = useTheme()

  const { isDrawerOpen } = useLayoutPublicContext()

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <LayoutContent hasDrawer={isDrawerOpen}>
      <Outlet />
      {isMobile && <LayoutFooter />}
    </LayoutContent>
  )
}
