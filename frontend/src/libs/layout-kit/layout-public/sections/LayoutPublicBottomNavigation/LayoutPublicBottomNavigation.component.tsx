import { useTheme } from '@mui/material'
import { ArrowSwapHorizontal, Graph, Note1, Book1 } from 'iconsax-react'
import { Link as RouterLink } from 'react-router-dom'

import { useLocationState } from 'hooks'
import { LayoutBottomNavigation } from 'libs/layout-kit/sections/LayoutBottomNavigation/LayoutBottomNavigation.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { PATHS } from 'routes'

export const LayoutPublicBottomNavigation = () => {
  const { t } = useTranslations()

  const theme = useTheme()

  const { pathname } = useLocationState()

  const isActiveRouteOrDescendant = (route: string) => pathname === route || pathname.startsWith(route)

  const isDashboard = isActiveRouteOrDescendant(PATHS.PUBLIC_DATA_EXPLORER)
  const isTransactions = isActiveRouteOrDescendant(PATHS.PUBLIC_TRANSACTIONS)
  const isReports = isActiveRouteOrDescendant(PATHS.PUBLIC_REPORTS)
  const isResources = isActiveRouteOrDescendant(PATHS.PUBLIC_RESOURCES)

  return (
    <LayoutBottomNavigation>
      <LayoutBottomNavigation.Action
        component={RouterLink}
        icon={<Graph color={theme.palette.primary.main} size={24} variant={isDashboard ? 'Bold' : 'Outline'} />}
        label={t({ id: 'publicDashboard' })}
        to={PATHS.PUBLIC_DATA_EXPLORER}
      />
      <LayoutBottomNavigation.Action
        component={RouterLink}
        icon={<Note1 color={theme.palette.primary.main} size={24} variant={isReports ? 'Bold' : 'Outline'} />}
        label={t({ id: 'publicReports' })}
        to={PATHS.PUBLIC_REPORTS}
      />
      <LayoutBottomNavigation.Action
        component={RouterLink}
        icon={<ArrowSwapHorizontal color={theme.palette.primary.main} size={24} variant={isTransactions ? 'Bold' : 'Outline'} />}
        label={t({ id: 'publicTransactions' })}
        to={PATHS.PUBLIC_TRANSACTIONS}
      />
      <LayoutBottomNavigation.Action
        component={RouterLink}
        icon={<Book1 color={theme.palette.primary.main} size={24} variant={isResources ? 'Bold' : 'Outline'} />}
        label={t({ id: 'publicResources' })}
        to={PATHS.PUBLIC_RESOURCES}
      />
    </LayoutBottomNavigation>
  )
}
