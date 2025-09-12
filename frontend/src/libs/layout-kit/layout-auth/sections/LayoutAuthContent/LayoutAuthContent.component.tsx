import { Outlet } from 'react-router-dom'

import { AutomaticLogout } from 'libs/authentication/components/AutomaticLogoutWrapper.component.tsx'
import { useLayoutAuthContext } from 'libs/layout-kit/layout-auth/hooks/useLayoutAuthContext.ts'
import { LayoutContent } from 'libs/layout-kit/sections/LayoutContent/LayoutContent.component.tsx'

export const LayoutAuthContent = () => {
  const { isDrawerOpen } = useLayoutAuthContext()

  return (
    <LayoutContent hasDrawer={isDrawerOpen}>
      <Outlet />
      <AutomaticLogout />
    </LayoutContent>
  )
}
