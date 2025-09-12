import { useMediaQuery, useTheme } from '@mui/material'
import Grid from '@mui/material/Grid'
import { Outlet } from 'react-router-dom'

import { LayoutPublicContextProvider } from 'libs/layout-kit/layout-public/components/LayoutPublicContext/LayoutPublicContext.component.tsx'
import { LayoutPublicBottomNavigation } from 'libs/layout-kit/layout-public/sections/LayoutPublicBottomNavigation/LayoutPublicBottomNavigation.component.tsx'
import { LayoutPublicSidebar } from 'libs/layout-kit/layout-public/sections/LayoutPublicSidebar/LayoutPublicSidebar.component.tsx'
import { LayoutContent } from 'libs/layout-kit/sections/LayoutContent/LayoutContent.component.tsx'
import { LayoutContentHeader } from 'libs/layout-kit/sections/LayoutContentHeader/LayoutContentHeader.component.tsx'
import { LayoutContentMain } from 'libs/layout-kit/sections/LayoutContentMain/LayoutContentMain.component.tsx'
import { LayoutFooter } from 'libs/layout-kit/sections/LayoutFooter/LayoutFooter.component.tsx'
import { CookieConsentBanner } from 'libs/ui-kit/components/CookieConsentBanner/CookieConsentBanner.tsx'

export const LayoutPublic = () => {
  const theme = useTheme()

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <LayoutPublicContextProvider>
      <Grid container direction={{ xs: 'column', sm: 'row' }} height="100%" size="grow" wrap="nowrap">
        {!isMobile && <LayoutPublicSidebar />}
        <LayoutContent isPublic>
          <Outlet />
          {isMobile && <LayoutFooter />}
        </LayoutContent>
        <CookieConsentBanner />
        {isMobile && <LayoutPublicBottomNavigation />}
      </Grid>
    </LayoutPublicContextProvider>
  )
}

LayoutPublic.Header = LayoutContentHeader
LayoutPublic.Main = LayoutContentMain
