import { ArrowSwapHorizontal, Book1, Briefcase, Icon, Note1 } from 'iconsax-react'
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
  const { handleSectionMenuToggle, isSidebarOpen, isResourcesOpen, isProjectsOpen, selectedOrganisation } = useLayoutPublicContext()

  const isActiveRouteOrDescendant = (route: string) => pathname === route || pathname.startsWith(route)
  const { RESOURCES_ROUTES } = useNavigationRoutes()

  const hasOrganisation = Boolean(organisationId || selectedOrganisation)

  const reportsRoute = organisationId ? getOrgPath('reports', organisationId) : hasOrganisation ? PATHS.PUBLIC_REPORTS : PATHS.ROOT
  const transactionsRoute = organisationId ? getOrgPath('transactions', organisationId) : hasOrganisation ? PATHS.PUBLIC_TRANSACTIONS : PATHS.ROOT
  const eventsRoute = organisationId ? getOrgPath('projects/events', organisationId) : hasOrganisation ? PATHS.PUBLIC_PROJECTS_EVENTS : PATHS.ROOT
  const overviewRoute = organisationId ? getOrgPath('projects/overview', organisationId) : hasOrganisation ? PATHS.PUBLIC_PROJECTS_OVERVIEW : PATHS.ROOT
  const projectsRoute = hasOrganisation ? PATHS.PUBLIC_PROJECTS : PATHS.ROOT

  const PROJECTS_ROUTES = [
    { label: t({ id: 'publicEvents' }), route: eventsRoute },
    { label: t({ id: 'publicOverview' }), route: overviewRoute }
  ]

  const menuItems: { icon: Icon; label: string; route: string }[] = [
    // NOTE: [LOB-2061] revoke dashboard route since it requires additional changes
    // { icon: TrendUp, label: t({ id: 'publicDashboard' }), route: PATHS.PUBLIC_DASHBOARD },
    { icon: Note1, label: t({ id: 'publicReports' }), route: reportsRoute },
    { icon: ArrowSwapHorizontal, label: t({ id: 'publicTransactions' }), route: transactionsRoute }
  ]

  const getCurrentPage = (route: string) => route !== PATHS.ROOT && isActiveRouteOrDescendant(route)

  return (
    <NavigationStyled>
      <ListStyled aria-labelledby={t({ id: 'navigation' })} disablePadding>
        {menuItems.map(({ icon, label, route }) => (
          <ButtonNavItem key={label} icon={icon} label={label} route={route} getCurrentPage={getCurrentPage} hasTooltip={!isSidebarOpen} />
        ))}

        <CollapseNavItem
          icon={Briefcase}
          label={t({ id: 'publicProjects' })}
          route={projectsRoute}
          subRoutes={PROJECTS_ROUTES}
          getCurrentPage={getCurrentPage}
          hasMainRoute
          onToggleMenu={() => handleSectionMenuToggle(MenuCategory.PROJECTS)}
          hasTooltip={!isSidebarOpen}
          isOpen={isProjectsOpen}
        />

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
