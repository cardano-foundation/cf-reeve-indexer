import { createBrowserRouter, createRoutesFromElements, Outlet, Route } from 'react-router-dom'

import { LayoutPublic } from 'libs/layout-kit/layout-public/LayoutPublic.component.tsx'
import { ViewCardIssuance } from 'modules/card-issuance/view/ViewCardIssuance.component.tsx'
// NOTE: [LOB-2061] revoke dashboard route since it requires additional changes
// import { ViewPublicDashboard } from 'modules/public-dashboard/view/ViewPublicDashboard.component'
import { ViewPublicDocumentDetail } from 'modules/public-document-detail/view/ViewPublicDocumentDetail.component.tsx'
import { ViewPublicDocuments } from 'modules/public-documents/view/ViewPublicDocuments.component.tsx'
import { ViewPublicEvents } from 'modules/public-events/view/ViewPublicEvents.component.tsx'
import { ViewFundingAudit } from 'modules/public-events-auditor/view/ViewFundingAudit.component.tsx'
import { ViewPublicLanding } from 'modules/public-landing/view/ViewPublicLanding.component.tsx'
import { ViewReportsPublic } from 'modules/public-reports/view/ViewReportsPublic.component.tsx'
import { ViewPublicResources } from 'modules/public-resources/view/ViewPublicResources.component.tsx'
import { ViewPublicResourcesGlossary } from 'modules/public-resources-glossary/view/ViewPublicResourcesGlossary.component'
import { ViewPublicResourcesUserGuide } from 'modules/public-resources-user-guide/view/ViewPublicResourcesUserGuide.component'
import { ViewPublicTransactions } from 'modules/public-transactions/view/ViewPublicTransactions.component.tsx'
import { ProtectedRoute } from 'routes/ProtectedRoute.tsx'

export const ROUTES = {
  ROOT: '/',
  // NOTE: [LOB-2061] revoke dashboard route since it requires additional changes
  // PUBLIC_DASHBOARD: 'dashboard',
  CARD_ISSUANCE: 'cards',
  PUBLIC_REPORTS: 'reports',
  PUBLIC_REPORTS_WITH_ORG: 'reports/:organisationId',
  PUBLIC_TRANSACTIONS: 'transactions',
  PUBLIC_TRANSACTIONS_WITH_ORG: 'transactions/:organisationId',
  PUBLIC_EVENTS: 'events',
  PUBLIC_EVENTS_WITH_ORG: 'events/:organisationId',
  PUBLIC_EVENTS_AUDIT: 'events/audit',
  PUBLIC_EVENTS_AUDIT_WITH_ORG: 'events/audit/:organisationId',
  PUBLIC_DOCUMENTS: 'documents',
  PUBLIC_DOCUMENTS_WITH_ORG: 'documents/:organisationId',
  PUBLIC_DOCUMENT_DETAIL: 'documents/:organisationId/detail/:documentId',
  PUBLIC_RESOURCES: 'resources',
  PUBLIC_RESOURCES_GLOSSARY: 'glossary',
  PUBLIC_RESOURCES_USERGUIDE: 'user-guide'
} as const

const createRoutePath = (routes: string[] = []) => `${ROUTES.ROOT}${routes.join('/')}`

export const PATHS = {
  ROOT: createRoutePath(),
  // NOTE: [LOB-2061] revoke dashboard route since it requires additional changes
  // PUBLIC_DASHBOARD: createRoutePath([ROUTES.PUBLIC_DASHBOARD]),
  CARD_ISSUANCE: createRoutePath([ROUTES.CARD_ISSUANCE]),
  PUBLIC_REPORTS: createRoutePath([ROUTES.PUBLIC_REPORTS]),
  PUBLIC_TRANSACTIONS: createRoutePath([ROUTES.PUBLIC_TRANSACTIONS]),
  PUBLIC_EVENTS: createRoutePath([ROUTES.PUBLIC_EVENTS]),
  PUBLIC_EVENTS_AUDIT: createRoutePath([ROUTES.PUBLIC_EVENTS_AUDIT]),
  PUBLIC_DOCUMENTS: createRoutePath([ROUTES.PUBLIC_DOCUMENTS]),
  PUBLIC_RESOURCES: createRoutePath([ROUTES.PUBLIC_RESOURCES]),
  PUBLIC_RESOURCES_GLOSSARY: createRoutePath([ROUTES.PUBLIC_RESOURCES, ROUTES.PUBLIC_RESOURCES_GLOSSARY]),
  PUBLIC_RESOURCES_USERGUIDE: createRoutePath([ROUTES.PUBLIC_RESOURCES, ROUTES.PUBLIC_RESOURCES_USERGUIDE]),
} as const

// Helper function to create paths with organisation ID
export const getOrgPath = (path: 'reports' | 'transactions' | 'events' | 'events/audit' | 'documents', organisationId: string) => `/${path}/${organisationId}`

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Outlet />} path={ROUTES.ROOT}>
      <Route element={<LayoutPublic />}>
        <Route index element={<ViewPublicLanding />} />
        {/* NOTE: [LOB-2061] revoke dashboard route since it requires additional changes */}
        {/* <Route element={<ViewPublicDashboard />} path={ROUTES.PUBLIC_DASHBOARD} /> */}
        {/* No ProtectedRoute: no org gate here - the backend enforces operator auth (HTTP Basic) on every card endpoint. */}
        <Route element={<ViewCardIssuance />} path={ROUTES.CARD_ISSUANCE} />
        <Route element={<ProtectedRoute element={<ViewReportsPublic />} />} path={ROUTES.PUBLIC_REPORTS} />
        <Route element={<ProtectedRoute element={<ViewReportsPublic />} />} path={ROUTES.PUBLIC_REPORTS_WITH_ORG} />
        <Route element={<ProtectedRoute element={<ViewPublicTransactions />} />} path={ROUTES.PUBLIC_TRANSACTIONS} />
        <Route element={<ProtectedRoute element={<ViewPublicTransactions />} />} path={ROUTES.PUBLIC_TRANSACTIONS_WITH_ORG} />
        <Route element={<ProtectedRoute element={<ViewFundingAudit />} />} path={ROUTES.PUBLIC_EVENTS_AUDIT} />
        <Route element={<ProtectedRoute element={<ViewFundingAudit />} />} path={ROUTES.PUBLIC_EVENTS_AUDIT_WITH_ORG} />
        <Route element={<ProtectedRoute element={<ViewPublicEvents />} />} path={ROUTES.PUBLIC_EVENTS} />
        <Route element={<ProtectedRoute element={<ViewPublicEvents />} />} path={ROUTES.PUBLIC_EVENTS_WITH_ORG} />
        <Route element={<ProtectedRoute element={<ViewPublicDocuments />} />} path={ROUTES.PUBLIC_DOCUMENTS} />
        <Route element={<ProtectedRoute element={<ViewPublicDocuments />} />} path={ROUTES.PUBLIC_DOCUMENTS_WITH_ORG} />
        <Route element={<ProtectedRoute element={<ViewPublicDocumentDetail />} />} path={ROUTES.PUBLIC_DOCUMENT_DETAIL} />
        <Route element={<Outlet />} path={ROUTES.PUBLIC_RESOURCES}>
          <Route element={<ViewPublicResources />} index />
          <Route element={<ViewPublicResourcesGlossary />} path={ROUTES.PUBLIC_RESOURCES_GLOSSARY} />
          <Route element={<ViewPublicResourcesUserGuide />} path={ROUTES.PUBLIC_RESOURCES_USERGUIDE} />
        </Route>
      </Route>
    </Route>
  )
)
