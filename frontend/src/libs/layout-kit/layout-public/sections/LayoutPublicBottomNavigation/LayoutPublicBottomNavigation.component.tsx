import { useTheme } from '@mui/material'
import { ArrowSwapHorizontal, Note1, Book1, DocumentText, Home2, Notepad2 } from 'iconsax-react'
import { Link as RouterLink } from 'react-router-dom'

import { useLocationState } from 'hooks'
import { useCurrentOrganisationId } from 'libs/layout-kit/layout-public/hooks/useCurrentOrganisationId.ts'
import { LayoutBottomNavigation } from 'libs/layout-kit/sections/LayoutBottomNavigation/LayoutBottomNavigation.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { PATHS, getOrgPath } from 'routes'

export const LayoutPublicBottomNavigation = () => {
  const { t } = useTranslations()

  const theme = useTheme()

  const { pathname } = useLocationState()

  const isActiveRouteOrDescendant = (route: string) => pathname === route || pathname.startsWith(route)

  // NOTE: [LOB-2061] revoke dashboard route since it requires additional changes
  // const isDashboard = isActiveRouteOrDescendant(PATHS.PUBLIC_DASHBOARD)
  const isTransactions = isActiveRouteOrDescendant(PATHS.PUBLIC_TRANSACTIONS)
  const isProjects = isActiveRouteOrDescendant(PATHS.PUBLIC_PROJECTS)
  const isReports = isActiveRouteOrDescendant(PATHS.PUBLIC_REPORTS)
  const isResources = isActiveRouteOrDescendant(PATHS.PUBLIC_RESOURCES)

  const currentOrganisationId = useCurrentOrganisationId()
  const hasOrganisation = Boolean(currentOrganisationId)

  const isDocuments = isActiveRouteOrDescendant(PATHS.PUBLIC_DOCUMENTS) || (!hasOrganisation && isActiveRouteOrDescendant(PATHS.CARD_ISSUANCE))

  const reportsPath = currentOrganisationId ? getOrgPath('reports', currentOrganisationId) : PATHS.PUBLIC_REPORTS
  const transactionsPath = currentOrganisationId ? getOrgPath('transactions', currentOrganisationId) : PATHS.PUBLIC_TRANSACTIONS
  const projectsPath = PATHS.PUBLIC_PROJECTS
  const documentsPath = currentOrganisationId ? getOrgPath('documents', currentOrganisationId) : PATHS.CARD_ISSUANCE

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
        icon={<Home2 color={theme.palette.primary.main} size={24} variant="Outline" />}
        label={t({ id: 'home' })}
        to={PATHS.ROOT}
        viewTransition
      />
      {hasOrganisation && [
        <LayoutBottomNavigation.Action
          key="reports"
          component={RouterLink}
          icon={<Note1 color={theme.palette.primary.main} size={24} variant={isReports ? 'Bold' : 'Outline'} />}
          label={t({ id: 'publicReports' })}
          to={reportsPath}
        />,
        <LayoutBottomNavigation.Action
          key="transactions"
          component={RouterLink}
          icon={<ArrowSwapHorizontal color={theme.palette.primary.main} size={24} variant={isTransactions ? 'Bold' : 'Outline'} />}
          label={t({ id: 'publicTransactions' })}
          to={transactionsPath}
        />,
        <LayoutBottomNavigation.Action
          key="projects"
          component={RouterLink}
          icon={<Notepad2 color={theme.palette.primary.main} size={24} variant={isProjects ? 'Bold' : 'Outline'} />}
          label={t({ id: 'publicProjects' })}
          to={projectsPath}
        />
      ]}
      <LayoutBottomNavigation.Action
        component={RouterLink}
        icon={<DocumentText color={theme.palette.primary.main} size={24} variant={isDocuments ? 'Bold' : 'Outline'} />}
        label={t({ id: 'publicDocuments' })}
        to={documentsPath}
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
