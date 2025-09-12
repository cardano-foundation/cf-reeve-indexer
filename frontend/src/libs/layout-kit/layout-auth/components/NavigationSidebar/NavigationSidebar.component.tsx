import { ArrowSwapHorizontal, Home2, Note1, Setting2, TrendUp } from 'iconsax-react'

import { useLocationState } from 'hooks'
import { ButtonNavItem } from 'libs/layout-kit/components/ButtonNavItem/ButtonNavItem.component.tsx'
import { CollapseNavItem } from 'libs/layout-kit/components/CollapseNavItem/CollapseNavItem.component.tsx'
import { CollapseNavWithSubCategories } from 'libs/layout-kit/components/CollapseNavWithSubCategories/CollapseNavWithSubCategories.component.tsx'
import { MenuCategory, MenuSubCategory } from 'libs/layout-kit/layout-auth/components/LayoutAuthContext/LayoutAuthContext.component.tsx'
import { useNavigationRoutes } from 'libs/layout-kit/layout-auth/components/NavigationSidebar/NavigationSidebar.service.tsx'
import { ListStyled, NavigationStyled } from 'libs/layout-kit/layout-auth/components/NavigationSidebar/NavigationSidebar.styles.tsx'
import { useLayoutAuthContext } from 'libs/layout-kit/layout-auth/hooks/useLayoutAuthContext.ts'
import { hasPermission } from 'libs/permissions/has-permission'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { PATHS } from 'routes'

export const NavigationSidebar = () => {
  const { t } = useTranslations()

  const { pathname } = useLocationState()

  const { toggledSubSection, handleSectionMenuToggle, handleSectionSubMenuToggle, isSidebarOpen, isTransactionsOpen, isDataExplorerOpen, isReportingOpen, isSettingsOpen } =
    useLayoutAuthContext()

  const getCurrentPage = (route: string) => pathname === route

  const { TRANSACTIONS_ROUTES, DATA_EXPLORER_ROUTES, REPORTING_ROUTES, SETTINGS_ROUTES } = useNavigationRoutes()

  const SETTINGS_SUB_SECTIONS = [
    { id: MenuSubCategory.ORGANIZATION, route: PATHS.SETTINGS_ORGANIZATION },
    { id: MenuSubCategory.ACCOUNT, route: PATHS.SETTINGS_ACCOUNTS }
  ]

  return (
    <NavigationStyled component="nav">
      <ListStyled aria-labelledby={t({ id: 'navigation' })} disablePadding>
        <ButtonNavItem
          icon={Home2}
          label={t({ id: 'home' })}
          route={PATHS.ROOT}
          getCurrentPage={getCurrentPage}
          onClick={() => handleSectionMenuToggle()}
          hasTooltip={!isSidebarOpen}
        />
        {hasPermission('transactions', 'view') && (
          <CollapseNavItem
            icon={ArrowSwapHorizontal}
            label={t({ id: 'transactions' })}
            route={PATHS.TRANSACTIONS}
            subRoutes={TRANSACTIONS_ROUTES}
            getCurrentPage={getCurrentPage}
            onToggleMenu={() => handleSectionMenuToggle(MenuCategory.TRANSACTIONS)}
            hasTooltip={!isSidebarOpen}
            isOpen={isTransactionsOpen}
          />
        )}
        {hasPermission('reports', 'view') && (
          <CollapseNavItem
            icon={Note1}
            label={t({ id: 'reporting' })}
            route={PATHS.REPORTING}
            subRoutes={REPORTING_ROUTES}
            getCurrentPage={getCurrentPage}
            onToggleMenu={() => handleSectionMenuToggle(MenuCategory.REPORTING)}
            hasTooltip={!isSidebarOpen}
            isOpen={isReportingOpen}
          />
        )}
        {hasPermission('data_explorer', 'view') && (
          <CollapseNavItem
            icon={TrendUp}
            label={t({ id: 'dataExplorer' })}
            route={PATHS.DATA_EXPLORER}
            subRoutes={DATA_EXPLORER_ROUTES}
            getCurrentPage={getCurrentPage}
            onToggleMenu={() => handleSectionMenuToggle(MenuCategory.DATA_EXPLORER)}
            hasTooltip={!isSidebarOpen}
            isOpen={isDataExplorerOpen}
          />
        )}
        {Boolean(SETTINGS_ROUTES.length) && (
          <CollapseNavWithSubCategories
            activeSubSection={toggledSubSection}
            icon={Setting2}
            label={t({ id: 'settings' })}
            route={PATHS.SETTINGS}
            subRoutes={SETTINGS_ROUTES}
            subSections={SETTINGS_SUB_SECTIONS}
            getCurrentPage={getCurrentPage}
            onToggleMenu={() => handleSectionMenuToggle(MenuCategory.SETTINGS)}
            onToggleSubMenu={handleSectionSubMenuToggle}
            hasTooltip={!isSidebarOpen}
            isOpen={isSettingsOpen}
          />
        )}
      </ListStyled>
    </NavigationStyled>
  )
}
