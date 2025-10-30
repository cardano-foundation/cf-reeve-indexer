import { ArrowSwapHorizontal, TrendUp, Note1, Book1 } from 'iconsax-react'
import { useLocationState } from 'hooks'
import { ButtonNavItem } from 'libs/layout-kit/components/ButtonNavItem/ButtonNavItem.component.tsx'
import { CollapseNavItem } from 'libs/layout-kit/components/CollapseNavItem/CollapseNavItem.component.tsx'
import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext.ts'
import { useNavigationRoutes } from 'libs/layout-kit/layout-public/components/NavigationSidebar/NavigationSidebar.service'
import { ListStyled, NavigationStyled } from 'libs/layout-kit/layout-public/components/NavigationSidebar/NavigationSidebar.styles.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { PATHS } from 'routes'
import { MenuCategory } from '../LayoutPublicContext/LayoutPublicContext.component'

export const NavigationSidebar = () => {
  const { t } = useTranslations()
  const { pathname } = useLocationState()
  const {
    handleSectionMenuToggle,
    isSidebarOpen,
    isResourcesOpen,
    selectedOrganisation,
  } = useLayoutPublicContext()

  const getCurrentPage = (route: string) => pathname === route
  const { RESOURCES_ROUTES } = useNavigationRoutes()

  const menuItems = selectedOrganisation === '75f95560c1d883ee7628993da5adf725a5d97a13929fd4f477be0faf5020ca94'
    ? [
        { icon: TrendUp, label: t({ id: 'publicDashboard' }), route: PATHS.PUBLIC_DASHBOARD },
        { icon: Note1, label: t({ id: 'publicReports' }), route: PATHS.PUBLIC_REPORTS },
        { icon: ArrowSwapHorizontal, label: t({ id: 'publicTransactions' }), route: PATHS.PUBLIC_TRANSACTIONS },
      ]
    : [
        { icon: TrendUp, label: t({ id: 'publicRewardDashboard' }), route: PATHS.PUBLIC_REWARD_DASHBOARD },
      ]

  return (
    <NavigationStyled>
      <ListStyled aria-labelledby={t({ id: 'navigation' })} disablePadding>
        {menuItems.map(({ icon, label, route }) => (
          <ButtonNavItem
            key={route}
            icon={icon}
            label={label}
            route={route}
            getCurrentPage={getCurrentPage}
            hasTooltip={!isSidebarOpen}
          />
        ))}

        {selectedOrganisation === '75f95560c1d883ee7628993da5adf725a5d97a13929fd4f477be0faf5020ca94' && (
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
        )}
      </ListStyled>
    </NavigationStyled>
  )
}
