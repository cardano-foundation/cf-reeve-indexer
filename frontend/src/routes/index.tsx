import { createBrowserRouter, createRoutesFromElements, Outlet, Route, Navigate } from 'react-router-dom'

import { LayoutPublic } from 'libs/layout-kit/layout-public/LayoutPublic.component.tsx'
import { ViewPublicDashboard } from 'modules/public-dashboard/view/ViewPublicDashboard.component'
import { ViewPublicResources } from 'modules/public-resources/view/ViewPublicResources.component.tsx'
import { ViewPublicResourcesGlossary } from 'modules/public-resources-glossary/view/ViewPublicResourcesGlossary.component'
import { ViewPublicResourcesUserGuide } from 'modules/public-resources-user-guide/view/ViewPublicResourcesUserGuide.component'
import { ViewPublicTransactions } from 'modules/public-transactions/view/ViewPublicTransactions.component.tsx'
import { ViewReportsPublic } from 'modules/public-reports/view/ViewReportsPublic.component.tsx'

export const ROUTES = {
  ROOT: '/',
  PUBLIC_DASHBOARD: 'dashboard',
  PUBLIC_REPORTS: 'reports',
  PUBLIC_TRANSACTIONS: 'transactions',
  PUBLIC_RESOURCES: 'resources',
  PUBLIC_RESOURCES_GLOSSARY: 'glossary',
  PUBLIC_RESOURCES_USERGUIDE: 'user-guide'
} as const

const createRoutePath = (routes: string[] = []) => `${ROUTES.ROOT}${routes.join('/')}`

export const PATHS = {
  ROOT: createRoutePath(),
<<<<<<< HEAD
  PUBLIC_DASHBOARD: createRoutePath([ROUTES_V2.PUBLIC_DASHBOARD]),
  PUBLIC_REPORTS: createRoutePath([ROUTES_V2.PUBLIC_REPORTS]),
  PUBLIC_TRANSACTIONS: createRoutePath([ROUTES_V2.PUBLIC_TRANSACTIONS]),
  PUBLIC_TRANSACTIONS_RESULTS: createRoutePath([ROUTES_V2.PUBLIC_TRANSACTIONS_RESULTS]),
  PUBLIC_RESOURCES: createRoutePath([ROUTES_V2.PUBLIC_RESOURCES]),
  PUBLIC_RESOURCES_GLOSSARY: createRoutePath([ROUTES_V2.PUBLIC_RESOURCES, ROUTES_V2.PUBLIC_RESOURCES_GLOSSARY]),
  PUBLIC_RESOURCES_USERGUIDE: createRoutePath([ROUTES_V2.PUBLIC_RESOURCES, ROUTES_V2.PUBLIC_RESOURCES_USERGUIDE]),
=======
  PUBLIC_DASHBOARD: createRoutePath([ROUTES.PUBLIC_DASHBOARD]),
  PUBLIC_REWARD_DASHBOARD: createRoutePath([ROUTES.PUBLIC_REWARD_DASHBOARD]),
  PUBLIC_REPORTS: createRoutePath([ROUTES.PUBLIC_REPORTS]),
  PUBLIC_TRANSACTIONS: createRoutePath([ROUTES.PUBLIC_TRANSACTIONS]),
  PUBLIC_RESOURCES: createRoutePath([ROUTES.PUBLIC_RESOURCES]),
  PUBLIC_RESOURCES_GLOSSARY: createRoutePath([ROUTES.PUBLIC_RESOURCES, ROUTES.PUBLIC_RESOURCES_GLOSSARY]),
  PUBLIC_RESOURCES_USERGUIDE: createRoutePath([ROUTES.PUBLIC_RESOURCES, ROUTES.PUBLIC_RESOURCES_USERGUIDE])
>>>>>>> main
} as const

export const router = createBrowserRouter(
  createRoutesFromElements(
<<<<<<< HEAD
    <Route element={<Outlet />} path={ROUTES_V2.ROOT}>
      <Route index element={<Navigate to={ROUTES_V2.PUBLIC_DASHBOARD} replace />} />
      <Route element={<LayoutPublic />}>
        <Route element={<ViewPublicDashboard />} path={ROUTES_V2.PUBLIC_DASHBOARD} />
        <Route element={<ViewReportsPublic />} path={ROUTES_V2.PUBLIC_REPORTS} />
        <Route element={<ViewPublicTransactions />} path={ROUTES_V2.PUBLIC_TRANSACTIONS} />
        <Route element={<ViewPublicTransactionsResults />} path={ROUTES_V2.PUBLIC_TRANSACTIONS_RESULTS} />
        <Route element={<Outlet />} path={ROUTES_V2.PUBLIC_RESOURCES}>
=======
    <Route element={<Outlet />} path={ROUTES.ROOT}>
      <Route element={<LayoutPublic />}>
        <Route element={<ViewPublicDashboard />} path={ROUTES.PUBLIC_DASHBOARD} />
        <Route element={<ViewPublicRewardDashboard />} path={ROUTES.PUBLIC_REWARD_DASHBOARD} />
        <Route element={<ViewReportsPublic />} path={ROUTES.PUBLIC_REPORTS} />
        <Route element={<ViewPublicTransactions />} path={ROUTES.PUBLIC_TRANSACTIONS} />
        <Route element={<Outlet />} path={ROUTES.PUBLIC_RESOURCES}>
>>>>>>> main
          <Route element={<ViewPublicResources />} index />
          <Route element={<ViewPublicResourcesGlossary />} path={ROUTES.PUBLIC_RESOURCES_GLOSSARY} />
          <Route element={<ViewPublicResourcesUserGuide />} path={ROUTES.PUBLIC_RESOURCES_USERGUIDE} />
        </Route>
      </Route>
    </Route>
  )
)
