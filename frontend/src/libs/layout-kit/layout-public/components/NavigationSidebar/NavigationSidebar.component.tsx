import { ArrowSwapHorizontal, Book1, Icon, Note1, Notepad2 } from 'iconsax-react'
import { useParams } from 'react-router-dom'

import { useLocationState } from 'hooks'
import { ButtonNavItem } from 'libs/layout-kit/components/ButtonNavItem/ButtonNavItem.component.tsx'
import { CollapseNavItem } from 'libs/layout-kit/components/CollapseNavItem/CollapseNavItem.component.tsx'
import { useNavigationRoutes } from 'libs/layout-kit/layout-public/components/NavigationSidebar/NavigationSidebar.service'
import { ListStyled, NavigationStyled } from 'libs/layout-kit/layout-public/components/NavigationSidebar/NavigationSidebar.styles.tsx'
import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { PATHS, getOrgPath } from 'routes'

import { MenuCategory } from '../LayoutPublicContext/LayoutPublicContext.component'

export const NavigationSidebar = () => {
  const { t } = useTranslations()
  const { pathname } = useLocationState()
  const { organisationId } = useParams<{ organisationId: string }>()
  const { handleSectionMenuToggle, isSidebarOpen, isResourcesOpen, selectedOrganisation } = useLayoutPublicContext()

  const isActiveRouteOrDescendant = (route: string) => pathname === route || pathname.startsWith(route)
  const { RESOURCES_ROUTES } = useNavigationRoutes()

  const hasOrganisation = Boolean(organisationId || selectedOrganisation)

  const reportsRoute = organisationId ? getOrgPath('reports', organisationId) : hasOrganisation ? PATHS.PUBLIC_REPORTS : PATHS.ROOT
  const transactionsRoute = organisationId ? getOrgPath('transactions', organisationId) : hasOrganisation ? PATHS.PUBLIC_TRANSACTIONS : PATHS.ROOT
  const projectsRoute = organisationId ? getOrgPath('projects', organisationId) : hasOrganisation ? PATHS.PUBLIC_PROJECTS : PATHS.ROOT



  const isProjectsActive = () => isActiveRouteOrDescendant(PATHS.PUBLIC_PROJECTS)

  const menuItems: { icon: Icon; label: string; route: string; isActive?: () => boolean }[] = [
    // NOTE: [LOB-2061] revoke dashboard route since it requires additional changes
    // { icon: TrendUp, label: t({ id: 'publicDashboard' }), route: PATHS.PUBLIC_DASHBOARD },
    { icon: Note1, label: t({ id: 'publicReports' }), route: reportsRoute },
    { icon: ArrowSwapHorizontal, label: t({ id: 'publicTransactions' }), route: transactionsRoute },
    { icon: Notepad2, label: t({ id: 'publicProjects' }), route: projectsRoute, isActive: isProjectsActive }
  ]

  const getCurrentPage = (route: string) => route !== PATHS.ROOT && isActiveRouteOrDescendant(route)

  return (
    <NavigationStyled>
      <ListStyled aria-labelledby={t({ id: 'navigation' })} disablePadding>
        {menuItems.map(({ icon, label, route, isActive }) => (
          <ButtonNavItem key={label} icon={icon} label={label} route={route} getCurrentPage={isActive ? () => isActive() : getCurrentPage} hasTooltip={!isSidebarOpen} />
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
