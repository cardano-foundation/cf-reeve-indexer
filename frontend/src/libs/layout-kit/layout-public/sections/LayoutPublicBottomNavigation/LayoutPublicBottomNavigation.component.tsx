import { useTheme } from '@mui/material'
import { ArrowSwapHorizontal, Note1, Book1 } from 'iconsax-react'
import { Link as RouterLink, useParams } from 'react-router-dom'

import { useLocationState } from 'hooks'
import { LayoutBottomNavigation } from 'libs/layout-kit/sections/LayoutBottomNavigation/LayoutBottomNavigation.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { PATHS, getOrgPath } from 'routes'

export const LayoutPublicBottomNavigation = () => {
  const { t } = useTranslations()

  const theme = useTheme()

  const { pathname } = useLocationState()
  const { organisationId } = useParams<{ organisationId: string }>()

  const isActiveRouteOrDescendant = (route: string) => pathname === route || pathname.startsWith(route)

  // NOTE: [LOB-2061] revoke dashboard route since it requires additional changes
  // const isDashboard = isActiveRouteOrDescendant(PATHS.PUBLIC_DASHBOARD)
  const isTransactions = isActiveRouteOrDescendant(PATHS.PUBLIC_TRANSACTIONS)
  const isReports = isActiveRouteOrDescendant(PATHS.PUBLIC_REPORTS)
  const isResources = isActiveRouteOrDescendant(PATHS.PUBLIC_RESOURCES)

  // Use organisation ID from URL path, otherwise use base paths
  const reportsPath = organisationId ? getOrgPath('reports', organisationId) : PATHS.PUBLIC_REPORTS
  const transactionsPath = organisationId ? getOrgPath('transactions', organisationId) : PATHS.PUBLIC_TRANSACTIONS

  return (
    <LayoutBottomNavigation>
      {/* NOTE: [LOB-2061] revoke dashboard route since it requires additional changes */}
      {/* <LayoutBottomNavigation.Action
        component={RouterLink}
        icon={<Graph color={theme.palette.primary.main} size={24} variant={isDashboard ? 'Bold' : 'Outline'} />}
        label={t({ id: 'publicDashboard' })}
        to={PATHS.PUBLIC_DASHBOARD}
      /> */}
      <LayoutBottomNavigation.Action
        component={RouterLink}
        icon={<Note1 color={theme.palette.primary.main} size={24} variant={isReports ? 'Bold' : 'Outline'} />}
        label={t({ id: 'publicReports' })}
        to={reportsPath}
      />
      <LayoutBottomNavigation.Action
        component={RouterLink}
        icon={<ArrowSwapHorizontal color={theme.palette.primary.main} size={24} variant={isTransactions ? 'Bold' : 'Outline'} />}
        label={t({ id: 'publicTransactions' })}
        to={transactionsPath}
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
