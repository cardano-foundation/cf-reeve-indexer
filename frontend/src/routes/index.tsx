import { createBrowserRouter, createRoutesFromElements, Outlet, Route } from 'react-router-dom'

import { LayoutPublic } from 'libs/layout-kit/layout-public/LayoutPublic.component.tsx'
import { ViewPublicDashboard } from 'modules/public-dashboard/view/ViewPublicDashboard.component'
import { ViewPublicResources } from 'modules/public-resources/view/ViewPublicResources.component.tsx'
import { ViewPublicResourcesGlossary } from 'modules/public-resources-glossary/view/ViewPublicResourcesGlossary.component'
import { ViewPublicResourcesUserGuide } from 'modules/public-resources-user-guide/view/ViewPublicResourcesUserGuide.component'
import { ViewPublicTransactions } from 'modules/public-transactions/view/ViewPublicTransactions.component.tsx'
import { ViewReportsPublic } from 'modules/public-reports/view/ViewReportsPublic.component.tsx'
import { ViewPublicRewardDashboard } from 'modules/public-reward-dashboard/view/ViewPublicRewardDashboard.component.tsx'

export const ROUTES = {
  ROOT: '/',
  PUBLIC_DATA_EXPLORER: 'data-explorer',
  PUBLIC_DASHBOARD: 'dashboard',
  PUBLIC_REWARD_DASHBOARD: 'reward-dashboard',
  PUBLIC_REPORTS: 'reports',
  PUBLIC_TRANSACTIONS: 'transactions',
  PUBLIC_RESOURCES: 'resources',
  PUBLIC_RESOURCES_GLOSSARY: 'glossary',
  PUBLIC_RESOURCES_USERGUIDE: 'user-guide'
} as const

const createRoutePath = (routes: string[] = []) => `${ROUTES.ROOT}${routes.join('/')}`

export const PATHS = {
  ROOT: createRoutePath(),
  PUBLIC_DASHBOARD: createRoutePath([ROUTES.PUBLIC_DASHBOARD]),
  PUBLIC_REWARD_DASHBOARD: createRoutePath([ROUTES.PUBLIC_REWARD_DASHBOARD]),
  PUBLIC_REPORTS: createRoutePath([ROUTES.PUBLIC_REPORTS]),
  PUBLIC_TRANSACTIONS: createRoutePath([ROUTES.PUBLIC_TRANSACTIONS]),
  PUBLIC_RESOURCES: createRoutePath([ROUTES.PUBLIC_RESOURCES]),
  PUBLIC_RESOURCES_GLOSSARY: createRoutePath([ROUTES.PUBLIC_RESOURCES, ROUTES.PUBLIC_RESOURCES_GLOSSARY]),
  PUBLIC_RESOURCES_USERGUIDE: createRoutePath([ROUTES.PUBLIC_RESOURCES, ROUTES.PUBLIC_RESOURCES_USERGUIDE])
} as const

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Outlet />} path={ROUTES.ROOT}>
      <Route element={<LayoutPublic />}>
        <Route element={<ViewPublicDashboard />} path={ROUTES.PUBLIC_DASHBOARD} />
        <Route element={<ViewPublicRewardDashboard />} path={ROUTES.PUBLIC_REWARD_DASHBOARD} />
        <Route element={<ViewReportsPublic />} path={ROUTES.PUBLIC_REPORTS} />
        <Route element={<ViewPublicTransactions />} path={ROUTES.PUBLIC_TRANSACTIONS} />
        <Route element={<Outlet />} path={ROUTES.PUBLIC_RESOURCES}>
          <Route element={<ViewPublicResources />} index />
          <Route element={<ViewPublicResourcesGlossary />} path={ROUTES.PUBLIC_RESOURCES_GLOSSARY} />
          <Route element={<ViewPublicResourcesUserGuide />} path={ROUTES.PUBLIC_RESOURCES_USERGUIDE} />
        </Route>
      </Route>
    </Route>
  )
)
