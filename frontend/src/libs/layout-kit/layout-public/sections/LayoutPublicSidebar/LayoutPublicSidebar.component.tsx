import { LogoSidebar } from 'libs/layout-kit/layout-public/components/LogoSidebar/LogoSidebar.component.tsx'
import { NavigationSidebar } from 'libs/layout-kit/layout-public/components/NavigationSidebar/NavigationSidebar.component.tsx'
import { OrganisationFormSidebar } from 'libs/layout-kit/layout-public/components/OrganisationFormSidebar/OrganisationFormSidebar.component.tsx'
import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext.ts'
import { LayoutSidebar } from 'libs/layout-kit/sections/LayoutSidebar/LayoutSidebar.component.tsx'

export const LayoutPublicSidebar = () => {
  const selectedOrganisation = '75f95560c1d883ee7628993da5adf725a5d97a13929fd4f477be0faf5020ca94'
  const { handleSidebarToggle, isSidebarOpen } = useLayoutPublicContext()

  const initialValues = {
    organisations: selectedOrganisation
  }

  return (
    <LayoutSidebar onToggleSidebar={handleSidebarToggle} isSidebarOpen={isSidebarOpen}>
      <OrganisationFormSidebar initialValues={initialValues} onSubmit={() => undefined} isSidebarOpen={isSidebarOpen} />
      <NavigationSidebar />
      <LogoSidebar isSidebarOpen={isSidebarOpen} />
    </LayoutSidebar>
  )
}
