import Grid from '@mui/material/Grid'
import { Outlet } from 'react-router-dom'

import { loginIllustration } from 'assets/images'
import { LayoutAuthPagesContentStyled } from 'libs/layout-kit/layout-auth-pages/LayoutAuthPages.styles.tsx'
import { getSessionStorageItem } from 'libs/storage-connectors/session-storage-connector/utils/getSessionStorageItem.ts'
import { ProtectedRoute } from 'libs/ui-kit/components/ProtectedRoute/ProtectedRoute.component.tsx'
import { PATHS } from 'routes'

export const LayoutAuthPages = () => {
  // NOTE: implementation should rely on the hook auth data and context
  // provided for the entire application
  const accessToken = getSessionStorageItem<string>('accessToken')

  return (
    <ProtectedRoute redirectPath={PATHS.ROOT} isAllowed={!accessToken}>
      <Grid component="main" container direction="row" height="100%" wrap="nowrap">
        <LayoutAuthPagesContentStyled container direction="column" wrap="nowrap" $bgImage={loginIllustration} size="grow">
          <Outlet />
        </LayoutAuthPagesContentStyled>
      </Grid>
    </ProtectedRoute>
  )
}
