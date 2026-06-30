import { ArrowSwapHorizontal, Note1, Book1, ReceiptText } from 'iconsax-react'
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
  const { handleSectionMenuToggle, isSidebarOpen, isResourcesOpen } = useLayoutPublicContext()

  const isActiveRouteOrDescendant = (route: string) => pathname === route || pathname.startsWith(route)
  const { RESOURCES_ROUTES } = useNavigationRoutes()

  const reportsRoute = organisationId ? getOrgPath('reports', organisationId) : PATHS.PUBLIC_REPORTS
  const transactionsRoute = organisationId ? getOrgPath('transactions', organisationId) : PATHS.PUBLIC_TRANSACTIONS
  const eventsRoute = organisationId ? getOrgPath('events', organisationId) : PATHS.PUBLIC_EVENTS

  const menuItems = [
    // NOTE: [LOB-2061] revoke dashboard route since it requires additional changes
    // { icon: TrendUp, label: t({ id: 'publicDashboard' }), route: PATHS.PUBLIC_DASHBOARD },
    { icon: Note1, label: t({ id: 'publicReports' }), route: reportsRoute },
    { icon: ArrowSwapHorizontal, label: t({ id: 'publicTransactions' }), route: transactionsRoute },
    { icon: ReceiptText, label: t({ id: 'publicEvents' }), route: eventsRoute }
  ]

  const getCurrentPage = (route: string) => isActiveRouteOrDescendant(route)

  return (
    <NavigationStyled>
      <ListStyled aria-labelledby={t({ id: 'navigation' })} disablePadding>
        {menuItems.map(({ icon, label, route }) => (
          <ButtonNavItem key={route} icon={icon} label={label} route={route} getCurrentPage={getCurrentPage} hasTooltip={!isSidebarOpen} />
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
