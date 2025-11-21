import { useMediaQuery, useTheme } from '@mui/material'
import Grid from '@mui/material/Grid'

import { LayoutPublicContextProvider } from 'libs/layout-kit/layout-public/components/LayoutPublicContext/LayoutPublicContext.component.tsx'
import { LayoutPublicBottomNavigation } from 'libs/layout-kit/layout-public/sections/LayoutPublicBottomNavigation/LayoutPublicBottomNavigation.component.tsx'
import { LayoutPublicSidebar } from 'libs/layout-kit/layout-public/sections/LayoutPublicSidebar/LayoutPublicSidebar.component.tsx'
import { LayoutContentDrawer } from 'libs/layout-kit/sections/LayoutContentDrawer/LayoutContentDrawer.component.tsx'
import { LayoutContentHeader } from 'libs/layout-kit/sections/LayoutContentHeader/LayoutContentHeader.component.tsx'
import { LayoutContentMain } from 'libs/layout-kit/sections/LayoutContentMain/LayoutContentMain.component.tsx'
import { LayoutPublicContent } from 'libs/layout-kit/layout-public/sections/LayoutPublicContent/LayoutPublicContent.component.tsx'
import { CookieConsentBanner } from 'libs/ui-kit/components/CookieConsentBanner/CookieConsentBanner.tsx'

export const LayoutPublic = () => {
  const theme = useTheme()

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <LayoutPublicContextProvider>
      <Grid container direction={{ xs: 'column', sm: 'row' }} height="100%" size="grow" wrap="nowrap">
        {!isMobile && <LayoutPublicSidebar />}
        <LayoutPublicContent />
        <CookieConsentBanner />
        {isMobile && <LayoutPublicBottomNavigation />}
      </Grid>
    </LayoutPublicContextProvider>
  )
}

LayoutPublic.Drawer = LayoutContentDrawer
LayoutPublic.Header = LayoutContentHeader
LayoutPublic.Main = LayoutContentMain
