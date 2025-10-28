import { ArrowSwapHorizontal, TrendUp, Note1, Book1 } from 'iconsax-react'

import { useLocationState } from 'hooks'
import { ButtonNavItem } from 'libs/layout-kit/components/ButtonNavItem/ButtonNavItem.component.tsx'
import { CollapseNavItem } from 'libs/layout-kit/components/CollapseNavItem/CollapseNavItem.component.tsx'
import { MenuCategory } from 'libs/layout-kit/layout-public/components/LayoutPublicContext/LayoutPublicContext.component.tsx'
import { useNavigationRoutes } from 'libs/layout-kit/layout-public/components/NavigationSidebar/NavigationSidebar.service'
import { ListStyled, NavigationStyled } from 'libs/layout-kit/layout-public/components/NavigationSidebar/NavigationSidebar.styles.tsx'
import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { PATHS } from 'routes'

export const NavigationSidebar = () => {
  const { t } = useTranslations()

  const { pathname } = useLocationState()

  const { handleSectionMenuToggle, isSidebarOpen, isResourcesOpen } = useLayoutPublicContext()

  const getCurrentPage = (route: string) => pathname === route

  const { RESOURCES_ROUTES, DATA_EXPLORER_ROUTES } = useNavigationRoutes()

  return (
    <NavigationStyled component="nav">
      <ListStyled aria-labelledby={t({ id: 'navigation' })} disablePadding>
        <ButtonNavItem icon={Note1} label={t({ id: 'publicReports' })} route={PATHS.PUBLIC_REPORTS} getCurrentPage={getCurrentPage} hasTooltip={!isSidebarOpen} />
        <ButtonNavItem
          icon={ArrowSwapHorizontal}
          label={t({ id: 'publicTransactions' })}
          route={PATHS.PUBLIC_TRANSACTIONS}
          getCurrentPage={getCurrentPage}
          hasTooltip={!isSidebarOpen}
        />
        <CollapseNavItem
          icon={TrendUp}
          label={t({ id: 'publicDataExplorer' })}
          route={PATHS.PUBLIC_DATA_EXPLORER}
          subRoutes={DATA_EXPLORER_ROUTES}
          getCurrentPage={getCurrentPage}
          hasMainRoute={true}
          onToggleMenu={() => handleSectionMenuToggle(MenuCategory.RESOURCES)}
          hasTooltip={!isSidebarOpen}
          isOpen={isResourcesOpen}
        />
        <CollapseNavItem
          icon={Book1}
          label={t({ id: 'publicResources' })}
          route={PATHS.PUBLIC_RESOURCES}
          subRoutes={RESOURCES_ROUTES}
          getCurrentPage={getCurrentPage}
          hasMainRoute={true}
          onToggleMenu={() => handleSectionMenuToggle(MenuCategory.RESOURCES)}
          hasTooltip={!isSidebarOpen}
          isOpen={isResourcesOpen}
        />
      </ListStyled>
    </NavigationStyled>
  )
}
