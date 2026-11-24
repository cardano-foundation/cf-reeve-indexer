import { ArrowSwapHorizontal, Book1, DocumentText, Home2, Note1, Notepad2 } from 'iconsax-react'

import { useLocationState } from 'hooks'
import { ButtonNavItem } from 'libs/layout-kit/components/ButtonNavItem/ButtonNavItem.component.tsx'
import { CollapseNavItem } from 'libs/layout-kit/components/CollapseNavItem/CollapseNavItem.component.tsx'
import { useNavigationRoutes } from 'libs/layout-kit/layout-public/components/NavigationSidebar/NavigationSidebar.service'
import { ListStyled, NavigationStyled } from 'libs/layout-kit/layout-public/components/NavigationSidebar/NavigationSidebar.styles.tsx'
import { useCurrentOrganisationId } from 'libs/layout-kit/layout-public/hooks/useCurrentOrganisationId.ts'
import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { PATHS, getOrgPath } from 'routes'

import { MenuCategory } from '../LayoutPublicContext/LayoutPublicContext.component'

import type { MenuItem } from './NavigationSidebar.types'

export const NavigationSidebar = () => {
  const { t } = useTranslations()
  const { pathname } = useLocationState()
  const { handleSectionMenuToggle, isSidebarOpen, isResourcesOpen } = useLayoutPublicContext()

  const isActiveRouteOrDescendant = (route: string) => pathname === route || pathname.startsWith(route)
  const { RESOURCES_ROUTES } = useNavigationRoutes()

  const currentOrganisationId = useCurrentOrganisationId()
  const hasOrganisation = Boolean(currentOrganisationId)

  const reportsRoute = currentOrganisationId ? getOrgPath('reports', currentOrganisationId) : PATHS.PUBLIC_REPORTS
  const transactionsRoute = currentOrganisationId ? getOrgPath('transactions', currentOrganisationId) : PATHS.PUBLIC_TRANSACTIONS
  const projectsRoute = currentOrganisationId ? getOrgPath('projects', currentOrganisationId) : PATHS.PUBLIC_PROJECTS
  const documentsRoute = currentOrganisationId ? getOrgPath('documents', currentOrganisationId) : PATHS.CARD_ISSUANCE

  const isProjectsActive = () => isActiveRouteOrDescendant(PATHS.PUBLIC_PROJECTS)

  const homeMenuItem: MenuItem = { icon: Home2, label: t({ id: 'home' }), route: PATHS.ROOT, hasViewTransition: true }
  const documentsMenuItem: MenuItem = { icon: DocumentText, label: t({ id: 'publicDocuments' }), route: documentsRoute }

  const organisationMenuItems: MenuItem[] = [
    // NOTE: [LOB-2061] revoke dashboard route since it requires additional changes
    // { icon: TrendUp, label: t({ id: 'publicDashboard' }), route: PATHS.PUBLIC_DASHBOARD },
    { icon: Note1, label: t({ id: 'publicReports' }), route: reportsRoute },
    { icon: ArrowSwapHorizontal, label: t({ id: 'publicTransactions' }), route: transactionsRoute },
    { icon: Notepad2, label: t({ id: 'publicProjects' }), route: projectsRoute, isActive: isProjectsActive },
    documentsMenuItem
  ]

  const menuItems = [homeMenuItem, ...(hasOrganisation ? organisationMenuItems : [documentsMenuItem])]

  const getCurrentPage = (route: string) => route !== PATHS.ROOT && isActiveRouteOrDescendant(route)

  return (
    <NavigationStyled>
      <ListStyled aria-label={t({ id: 'navigation' })} disablePadding>
        {menuItems.map(({ icon, label, route, isActive, hasViewTransition }) => (
          <ButtonNavItem
            key={label}
            icon={icon}
            label={label}
            route={route}
            getCurrentPage={isActive ? () => isActive() : getCurrentPage}
            hasTooltip={!isSidebarOpen}
            hasViewTransition={hasViewTransition}
          />
        ))}

        <CollapseNavItem
          icon={Book1}
          label={t({ id: 'publicResources' })}
          route={PATHS.PUBLIC_RESOURCES}
          subRoutes={RESOURCES_ROUTES}
          getCurrentPage={getCurrentPage}
          hasMainRoute
          onToggleMenu={() => handleSectionMenuToggle(MenuCategory.RESOURCES)}
          hasTooltip={!isSidebarOpen}
          isOpen={isResourcesOpen}
        />
      </ListStyled>
    </NavigationStyled>
  )
}
