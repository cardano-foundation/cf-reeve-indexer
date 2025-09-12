import { LogoSidebar } from 'libs/layout-kit/layout-auth/components/LogoSidebar/LogoSidebar.component.tsx'
import { NavigationSidebar } from 'libs/layout-kit/layout-auth/components/NavigationSidebar/NavigationSidebar.component.tsx'
import { UserProfileSidebar } from 'libs/layout-kit/layout-auth/components/UserProfileSidebar/UserProfileSidebar.component.tsx'
import { useLayoutAuthContext } from 'libs/layout-kit/layout-auth/hooks/useLayoutAuthContext.ts'
import { LayoutSidebar } from 'libs/layout-kit/sections/LayoutSidebar/LayoutSidebar.component.tsx'

export const LayoutAuthSidebar = () => {
  const { handleSidebarToggle, isSidebarOpen } = useLayoutAuthContext()

  return (
    <LayoutSidebar onToggleSidebar={handleSidebarToggle} isSidebarOpen={isSidebarOpen}>
      <LogoSidebar />
      <NavigationSidebar />
      <UserProfileSidebar />
    </LayoutSidebar>
  )
}
