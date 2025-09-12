import Grid from '@mui/material/Grid'

import { useTokenRefresh } from 'libs/authentication/hooks/useTokenRefresh'
import { LayoutAuthContextProvider } from 'libs/layout-kit/layout-auth/components/LayoutAuthContext/LayoutAuthContext.component.tsx'
import { LayoutAuthContent } from 'libs/layout-kit/layout-auth/sections/LayoutAuthContent/LayoutAuthContent.component.tsx'
import { LayoutAuthSidebar } from 'libs/layout-kit/layout-auth/sections/LayoutAuthSidebar/LayoutAuthSidebar.component.tsx'
import { LayoutContentDrawer } from 'libs/layout-kit/sections/LayoutContentDrawer/LayoutContentDrawer.component.tsx'
import { LayoutContentHeader } from 'libs/layout-kit/sections/LayoutContentHeader/LayoutContentHeader.component.tsx'
import { LayoutContentMain } from 'libs/layout-kit/sections/LayoutContentMain/LayoutContentMain.component.tsx'
import { getSessionStorageItem } from 'libs/storage-connectors/session-storage-connector/utils/getSessionStorageItem.ts'
import { ProtectedRoute } from 'libs/ui-kit/components/ProtectedRoute/ProtectedRoute.component.tsx'
import { PATHS } from 'routes'

export const LayoutAuth = () => {
  useTokenRefresh()
  // NOTE: implementation should rely on the hook auth data and context
  // provided for the entire application
  const accessToken = getSessionStorageItem<string>('accessToken')

  return (
    <ProtectedRoute redirectPath={PATHS.AUTH_LOGIN} isAllowed={!!accessToken}>
      <LayoutAuthContextProvider>
        <Grid container direction={{ xs: 'column', sm: 'row' }} height="100%" size="grow" wrap="nowrap">
          <LayoutAuthSidebar />
          <LayoutAuthContent />
        </Grid>
      </LayoutAuthContextProvider>
    </ProtectedRoute>
  )
}

LayoutAuth.Drawer = LayoutContentDrawer
LayoutAuth.Header = LayoutContentHeader
LayoutAuth.Main = LayoutContentMain
