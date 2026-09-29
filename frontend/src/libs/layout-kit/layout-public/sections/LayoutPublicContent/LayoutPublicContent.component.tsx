import { useMediaQuery, useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import { Outlet } from 'react-router-dom'

import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext.ts'
import { LayoutContent } from 'libs/layout-kit/sections/LayoutContent/LayoutContent.component.tsx'
import { LayoutFooter } from 'libs/layout-kit/sections/LayoutFooter/LayoutFooter.component.tsx'
import { LayoutFooterDesktop } from 'libs/layout-kit/sections/LayoutFooterDesktop/LayoutFooterDesktop.component.tsx'

export const LayoutPublicContent = () => {
  const theme = useTheme()

  const { isDrawerOpen } = useLayoutPublicContext()

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  if (isMobile) {
    return (
      <LayoutContent hasDrawer={isDrawerOpen}>
        <Outlet />
        <LayoutFooter />
      </LayoutContent>
    )
  }

  return (
    <LayoutContent hasDrawer={isDrawerOpen}>
      <Box display="flex" flexDirection="column" flex="1 1 0" minHeight={0} overflow="hidden auto">
        <Outlet />
      </Box>
      <LayoutFooterDesktop />
    </LayoutContent>
  )
}
