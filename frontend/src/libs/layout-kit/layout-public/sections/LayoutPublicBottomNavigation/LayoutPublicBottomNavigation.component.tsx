import { useTheme } from '@mui/material'
import { ArrowSwapHorizontal, Note1, Book1, Briefcase } from 'iconsax-react'
import { Link as RouterLink, useParams } from 'react-router-dom'

import { useLocationState } from 'hooks'
import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext.ts'
import { LayoutBottomNavigation } from 'libs/layout-kit/sections/LayoutBottomNavigation/LayoutBottomNavigation.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { PATHS, getOrgPath } from 'routes'

export const LayoutPublicBottomNavigation = () => {
  const { t } = useTranslations()

  const theme = useTheme()

  const { pathname } = useLocationState()
  const { organisationId } = useParams<{ organisationId: string }>()
  const { selectedOrganisation } = useLayoutPublicContext()

  const isActiveRouteOrDescendant = (route: string) => pathname === route || pathname.startsWith(route)

  // NOTE: [LOB-2061] revoke dashboard route since it requires additional changes
  // const isDashboard = isActiveRouteOrDescendant(PATHS.PUBLIC_DASHBOARD)
  const isTransactions = isActiveRouteOrDescendant(PATHS.PUBLIC_TRANSACTIONS)
  const isProjects = isActiveRouteOrDescendant(PATHS.PUBLIC_PROJECTS)
  const isReports = isActiveRouteOrDescendant(PATHS.PUBLIC_REPORTS)
  const isResources = isActiveRouteOrDescendant(PATHS.PUBLIC_RESOURCES)

  const hasOrganisation = Boolean(organisationId || selectedOrganisation)

  // Use organisation ID from URL path, otherwise use base paths
  const reportsPath = organisationId ? getOrgPath('reports', organisationId) : hasOrganisation ? PATHS.PUBLIC_REPORTS : PATHS.ROOT
  const transactionsPath = organisationId ? getOrgPath('transactions', organisationId) : hasOrganisation ? PATHS.PUBLIC_TRANSACTIONS : PATHS.ROOT
  const projectsPath = hasOrganisation ? PATHS.PUBLIC_PROJECTS : PATHS.ROOT

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
        icon={<Briefcase color={theme.palette.primary.main} size={24} variant={isProjects ? 'Bold' : 'Outline'} />}
        label={t({ id: 'publicProjects' })}
        to={projectsPath}
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
