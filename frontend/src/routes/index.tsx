import { createBrowserRouter, createRoutesFromElements, Outlet, Route, Navigate } from 'react-router-dom'

import { LayoutPublic } from 'libs/layout-kit/layout-public/LayoutPublic.component.tsx'
import { ViewPublicDashboard } from 'modules/public-dashboard/view/ViewPublicDashboard.component'
import { ViewPublicResources } from 'modules/public-resources/view/ViewPublicResources.component.tsx'
import { ViewPublicResourcesGlossary } from 'modules/public-resources-glossary/view/ViewPublicResourcesGlossary.component'
import { ViewPublicResourcesUserGuide } from 'modules/public-resources-user-guide/view/ViewPublicResourcesUserGuide.component'
import { ViewPublicTransactions } from 'modules/public-transactions/view/ViewPublicTransactions.component.tsx'
import { ViewPublicTransactionsResults } from 'modules/public-transactions-results/view/ViewPublicTransactionsResults.component.tsx'
import { ViewReportsPublic } from 'modules/public-reports/view/ViewReportsPublic.component.tsx'

export const ROUTES_V2 = {
  ROOT: '/',
  PUBLIC_DATA_EXPLORER: 'data-explorer',
  PUBLIC_DASHBOARD: 'dashboard',
  PUBLIC_REPORTS: 'reports',
  PUBLIC_TRANSACTIONS: 'transactions',
  PUBLIC_TRANSACTIONS_RESULTS: 'transactions-results',
  PUBLIC_RESOURCES: 'resources',
  PUBLIC_RESOURCES_GLOSSARY: 'glossary',
  PUBLIC_RESOURCES_USERGUIDE: 'user-guide',
} as const

const createRoutePath = (routes: string[] = []) => `${ROUTES_V2.ROOT}${routes.join('/')}`

export const PATHS = {
  ROOT: createRoutePath(),
  PUBLIC_DASHBOARD: createRoutePath([ROUTES_V2.PUBLIC_DASHBOARD]),
  PUBLIC_REPORTS: createRoutePath([ROUTES_V2.PUBLIC_REPORTS]),
  PUBLIC_TRANSACTIONS: createRoutePath([ROUTES_V2.PUBLIC_TRANSACTIONS]),
  PUBLIC_TRANSACTIONS_RESULTS: createRoutePath([ROUTES_V2.PUBLIC_TRANSACTIONS_RESULTS]),
  PUBLIC_RESOURCES: createRoutePath([ROUTES_V2.PUBLIC_RESOURCES]),
  PUBLIC_RESOURCES_GLOSSARY: createRoutePath([ROUTES_V2.PUBLIC_RESOURCES, ROUTES_V2.PUBLIC_RESOURCES_GLOSSARY]),
  PUBLIC_RESOURCES_USERGUIDE: createRoutePath([ROUTES_V2.PUBLIC_RESOURCES, ROUTES_V2.PUBLIC_RESOURCES_USERGUIDE]),
} as const

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Outlet />} path={ROUTES_V2.ROOT}>
      <Route index element={<Navigate to={ROUTES_V2.PUBLIC_DASHBOARD} replace />} />
      <Route element={<LayoutPublic />}>
        <Route element={<ViewPublicDashboard />} path={ROUTES_V2.PUBLIC_DASHBOARD} />
        <Route element={<ViewReportsPublic />} path={ROUTES_V2.PUBLIC_REPORTS} />
        <Route element={<ViewPublicTransactions />} path={ROUTES_V2.PUBLIC_TRANSACTIONS} />
        <Route element={<ViewPublicTransactionsResults />} path={ROUTES_V2.PUBLIC_TRANSACTIONS_RESULTS} />
        <Route element={<Outlet />} path={ROUTES_V2.PUBLIC_RESOURCES}>
          <Route element={<ViewPublicResources />} index />
          <Route element={<ViewPublicResourcesGlossary />} path={ROUTES_V2.PUBLIC_RESOURCES_GLOSSARY} />
          <Route element={<ViewPublicResourcesUserGuide />} path={ROUTES_V2.PUBLIC_RESOURCES_USERGUIDE} />
        </Route>
      </Route>
    </Route>
  )
)
