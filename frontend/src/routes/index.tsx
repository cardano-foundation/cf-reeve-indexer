import { createBrowserRouter, createRoutesFromElements, Outlet, Route } from 'react-router-dom'

import { LayoutAuth } from 'libs/layout-kit/layout-auth/LayoutAuth.component.tsx'
import { LayoutAuthPages } from 'libs/layout-kit/layout-auth-pages/LayoutAuthPages.component.tsx'
import { LayoutPublic } from 'libs/layout-kit/layout-public/LayoutPublic.component.tsx'
import { RequirePermission } from 'libs/permissions/RequirePermission'
import { ViewLogin } from 'modules/auth-login/view/ViewLogin.component.tsx'
import { ViewBatchesList } from 'modules/batches-all/view/ViewBatchesAll.component.tsx'
import { ViewChartOfAccounts } from 'modules/chart-of-accounts/view/ViewChartOfAccounts.component.tsx'
import { ViewCostCenters } from 'modules/cost-centers/view/ViewCostCenters.component.tsx'
import { ViewDashboard } from 'modules/dashboard/view/ViewDashboard.component.tsx'
import { ViewDashboardBuilder } from 'modules/dashboard-builder/view/ViewDashboardBuilder.component.tsx'
import { ViewDataExplorer } from 'modules/data-explorer/view/ViewDataExplorer.component.tsx'
import { ViewEventRefCodes } from 'modules/event-ref-codes/view/ViewEventRefCodes.component'
import { ViewExtraction } from 'modules/extraction/view/ViewExtraction.component.tsx'
import { ViewExtractionResults } from 'modules/extraction-results/view/ViewExtractionResults.component.tsx'
import { ViewHome } from 'modules/home/view/ViewHome.component.tsx'
import { ViewImport } from 'modules/import/view/ViewImport.component.tsx'
import { ViewOrganization } from 'modules/organization/view/ViewOrganization.component.tsx'
import { ViewOrganizationSetup } from 'modules/organization-setup/view/ViewOrganizationSetup.component.tsx'
import { ViewOrganizationDetails } from 'modules/organizationDetails/view/ViewOrganizationDetails.component.tsx'
import { ViewNotFound } from 'modules/page-not-found/view/ViewNotFound.component.tsx'
import { ViewPublicDashboard } from 'modules/public-dashboard/view/ViewPublicDashboard.component.tsx'
import { ViewPublicResources } from 'modules/public-resources/view/ViewPublicResources.component.tsx'
import { ViewPublicResourcesGlossary } from 'modules/public-resources-glossary/view/ViewPublicResourcesGlossary.component'
import { ViewPublicResourcesUserGuide } from 'modules/public-resources-user-guide/view/ViewPublicResourcesUserGuide.component'
import { ViewPublicTransactions } from 'modules/public-transactions/view/ViewPublicTransactions.component.tsx'
import { ViewPublicTransactionsResults } from 'modules/public-transactions-results/view/ViewPublicTransactionsResults.component.tsx'
import { BatchPublishContextProvider } from 'modules/publish/components/BatchPublishContext/BatchPublishContext.component.tsx'
import { TransactionsPublishContextProvider } from 'modules/publish/components/TransactionsPublishContext/TransactionsPublishContext.component.tsx'
import { ViewBatchesPublish } from 'modules/publish/view/ViewBatchesPublish.component.tsx'
import { ViewReconciliation } from 'modules/reconciliation/view/ViewReconciliation.component.tsx'
import { ViewReportParameters } from 'modules/report-parameters/view/ViewReportParameters.component.tsx'
import { ViewReportType } from 'modules/report-type/view/ViewReportType.component.tsx'
import { ViewReporting } from 'modules/reporting/view/ViewReporting.component'
import { ViewReports } from 'modules/reports/view/ViewReports.component.tsx'
import { ViewReportsPublic } from 'modules/reports-public/view/ViewReportsPublic.component.tsx'
import { ViewReportsPublish } from 'modules/reports-publish/view/ViewReportsPublish.component.tsx'
import { BatchContextProvider } from 'modules/review/components/BatchContext/BatchContext.component.tsx'
import { TransactionsContextProvider } from 'modules/review/components/TransactionsContext/TransactionsContext.component.tsx'
import { TransactionsReprocessContextProvider } from 'modules/review/components/TransactionsReprocessContext/TransactionsReprocessContext.component.tsx'
import { ViewBatchesReview } from 'modules/review/view/ViewBatchesReview.component.tsx'
import { ViewSettings } from 'modules/settings/view/ViewSettings.component'
import { ViewTransactions } from 'modules/transactions/view/ViewTransactions.component.tsx'
import { ViewVatCodes } from 'modules/vat-codes/view/ViewVatCodes.component.tsx'

export const ROUTES_V2 = {
  ROOT: '/',
  AUTH_LOGIN: 'auth/login',
  TRANSACTIONS: 'secure/transactions',
  TRANSACTIONS_IMPORT: 'import',
  TRANSACTIONS_REVIEW: 'review',
  TRANSACTIONS_REVIEW_APPROVE: 'review/:batchId/approve',
  TRANSACTIONS_REVIEW_PENDING: 'review/:batchId/pending',
  TRANSACTIONS_REVIEW_INVALID: 'review/:batchId/invalid',
  TRANSACTIONS_REVIEW_APPROVED: 'review/:batchId/approved',
  TRANSACTIONS_PUBLISH: 'publish',
  TRANSACTIONS_PUBLISH_APPROVE: 'publish/:batchId/approve',
  TRANSACTIONS_PUBLISH_APPROVED: 'publish/:batchId/approved',
  TRANSACTIONS_RECONCILIATION: 'reconciliation',
  TRANSACTIONS_RECONCILIATION_APPROVE: 'reconciliation/unreconciled',
  TRANSACTIONS_RECONCILIATION_APPROVED: 'reconciliation/reconciled',
  TRANSACTIONS_BATCHES: 'batches',
  DATA_EXPLORER: 'secure/data-explorer',
  DATA_EXPLORER_DASHBOARD: 'dashboard',
  DATA_EXPLORER_DASHBOARD_BUILDER: 'dashboard/builder',
  DATA_EXPLORER_EXTRACTION: 'extraction',
  DATA_EXPLORER_EXTRACTION_RESULTS: 'extraction-results',
  PUBLIC_DASHBOARD: 'dashboard',
  PUBLIC_REPORTS: 'reports',
  PUBLIC_TRANSACTIONS: 'transactions',
  PUBLIC_TRANSACTIONS_RESULTS: 'transactions-results',
  PUBLIC_RESOURCES: 'resources',
  PUBLIC_RESOURCES_GLOSSARY: 'glossary',
  PUBLIC_RESOURCES_USERGUIDE: 'user-guide',
  REPORTING: 'secure/reporting',
  REPORTING_REPORT_PARAMETERS: 'report/parameters',
  REPORTING_REPORT_TYPE: 'report/:reportType',
  REPORTING_PUBLISH: 'publish',
  REPORTING_REPORTS: 'reports',
  SETTINGS: 'secure/settings',
  SETTINGS_USER_MANAGEMENT: 'user-management',
  SETTINGS_ORGANIZATION: 'organization',
  SETTINGS_SETUP: 'organization/setup',
  SETTINGS_ORGANIZATION_DETAILS: 'organization/details',
  SETTINGS_ACCOUNTS: 'organization/accounts',
  SETTINGS_COST_CENTERS: 'organization/cost-centers',
  SETTINGS_PROJECTS: 'organization/projects',
  SETTINGS_VAT_CODES: 'organization/vat-codes',
  SETTINGS_CURRENCIES: 'organization/currencies',
  SETTINGS_EVENT_CODES: 'organization/event-codes'
} as const

const createRoutePath = (routes: string[] = []) => `${ROUTES_V2.ROOT}${routes.join('/')}`

export const PATHS = {
  ROOT: createRoutePath(),
  AUTH_LOGIN: createRoutePath([ROUTES_V2.AUTH_LOGIN]),
  TRANSACTIONS: createRoutePath([ROUTES_V2.TRANSACTIONS]),
  TRANSACTIONS_IMPORT: createRoutePath([ROUTES_V2.TRANSACTIONS, ROUTES_V2.TRANSACTIONS_IMPORT]),
  TRANSACTIONS_REVIEW: createRoutePath([ROUTES_V2.TRANSACTIONS, ROUTES_V2.TRANSACTIONS_REVIEW]),
  TRANSACTIONS_REVIEW_APPROVE: createRoutePath([ROUTES_V2.TRANSACTIONS, ROUTES_V2.TRANSACTIONS_REVIEW_APPROVE]),
  TRANSACTIONS_REVIEW_PENDING: createRoutePath([ROUTES_V2.TRANSACTIONS, ROUTES_V2.TRANSACTIONS_REVIEW_PENDING]),
  TRANSACTIONS_REVIEW_INVALID: createRoutePath([ROUTES_V2.TRANSACTIONS, ROUTES_V2.TRANSACTIONS_REVIEW_INVALID]),
  TRANSACTIONS_REVIEW_APPROVED: createRoutePath([ROUTES_V2.TRANSACTIONS, ROUTES_V2.TRANSACTIONS_REVIEW_APPROVED]),
  TRANSACTIONS_PUBLISH: createRoutePath([ROUTES_V2.TRANSACTIONS, ROUTES_V2.TRANSACTIONS_PUBLISH]),
  TRANSACTIONS_PUBLISH_APPROVE: createRoutePath([ROUTES_V2.TRANSACTIONS, ROUTES_V2.TRANSACTIONS_PUBLISH_APPROVE]),
  TRANSACTIONS_PUBLISH_APPROVED: createRoutePath([ROUTES_V2.TRANSACTIONS, ROUTES_V2.TRANSACTIONS_PUBLISH_APPROVED]),
  TRANSACTIONS_RECONCILIATION: createRoutePath([ROUTES_V2.TRANSACTIONS, ROUTES_V2.TRANSACTIONS_RECONCILIATION]),
  TRANSACTIONS_RECONCILIATION_APPROVE: createRoutePath([ROUTES_V2.TRANSACTIONS, ROUTES_V2.TRANSACTIONS_RECONCILIATION_APPROVE]),
  TRANSACTIONS_RECONCILIATION_APPROVED: createRoutePath([ROUTES_V2.TRANSACTIONS, ROUTES_V2.TRANSACTIONS_RECONCILIATION_APPROVED]),
  TRANSACTIONS_BATCHES: createRoutePath([ROUTES_V2.TRANSACTIONS, ROUTES_V2.TRANSACTIONS_BATCHES]),
  DATA_EXPLORER: createRoutePath([ROUTES_V2.DATA_EXPLORER]),
  DATA_EXPLORER_DASHBOARD: createRoutePath([ROUTES_V2.DATA_EXPLORER, ROUTES_V2.DATA_EXPLORER_DASHBOARD]),
  DATA_EXPLORER_DASHBOARD_BUILDER: createRoutePath([ROUTES_V2.DATA_EXPLORER, ROUTES_V2.DATA_EXPLORER_DASHBOARD_BUILDER]),
  DATA_EXPLORER_EXTRACTION: createRoutePath([ROUTES_V2.DATA_EXPLORER, ROUTES_V2.DATA_EXPLORER_EXTRACTION]),
  DATA_EXPLORER_EXTRACTION_RESULTS: createRoutePath([ROUTES_V2.DATA_EXPLORER, ROUTES_V2.DATA_EXPLORER_EXTRACTION_RESULTS]),
  PUBLIC_DASHBOARD: createRoutePath([ROUTES_V2.PUBLIC_DASHBOARD]),
  PUBLIC_REPORTS: createRoutePath([ROUTES_V2.PUBLIC_REPORTS]),
  PUBLIC_TRANSACTIONS: createRoutePath([ROUTES_V2.PUBLIC_TRANSACTIONS]),
  PUBLIC_TRANSACTIONS_RESULTS: createRoutePath([ROUTES_V2.PUBLIC_TRANSACTIONS_RESULTS]),
  PUBLIC_RESOURCES: createRoutePath([ROUTES_V2.PUBLIC_RESOURCES]),
  PUBLIC_RESOURCES_GLOSSARY: createRoutePath([ROUTES_V2.PUBLIC_RESOURCES, ROUTES_V2.PUBLIC_RESOURCES_GLOSSARY]),
  PUBLIC_RESOURCES_USERGUIDE: createRoutePath([ROUTES_V2.PUBLIC_RESOURCES, ROUTES_V2.PUBLIC_RESOURCES_USERGUIDE]),
  REPORTING: createRoutePath([ROUTES_V2.REPORTING]),
  REPORTING_REPORT_PARAMETERS: createRoutePath([ROUTES_V2.REPORTING, ROUTES_V2.REPORTING_REPORT_PARAMETERS]),
  REPORTING_REPORT_TYPE: createRoutePath([ROUTES_V2.REPORTING, ROUTES_V2.REPORTING_REPORT_TYPE]),
  REPORTING_PUBLISH: createRoutePath([ROUTES_V2.REPORTING, ROUTES_V2.REPORTING_PUBLISH]),
  REPORTING_REPORTS: createRoutePath([ROUTES_V2.REPORTING, ROUTES_V2.REPORTING_REPORTS]),
  SETTINGS: createRoutePath([ROUTES_V2.SETTINGS]),
  SETTINGS_ORGANIZATION: createRoutePath([ROUTES_V2.SETTINGS, ROUTES_V2.SETTINGS_ORGANIZATION]),
  SETTINGS_SETUP: createRoutePath([ROUTES_V2.SETTINGS, ROUTES_V2.SETTINGS_SETUP]),
  SETTINGS_ORGANIZATION_DETAILS: createRoutePath([ROUTES_V2.SETTINGS, ROUTES_V2.SETTINGS_ORGANIZATION_DETAILS]),
  SETTINGS_USER_MANAGEMENT: createRoutePath([ROUTES_V2.SETTINGS, ROUTES_V2.SETTINGS_USER_MANAGEMENT]),
  SETTINGS_ACCOUNTS: createRoutePath([ROUTES_V2.SETTINGS, ROUTES_V2.SETTINGS_ACCOUNTS]),
  SETTINGS_COST_CENTERS: createRoutePath([ROUTES_V2.SETTINGS, ROUTES_V2.SETTINGS_COST_CENTERS]),
  SETTINGS_PROJECTS: createRoutePath([ROUTES_V2.SETTINGS, ROUTES_V2.SETTINGS_PROJECTS]),
  SETTINGS_VAT_CODES: createRoutePath([ROUTES_V2.SETTINGS, ROUTES_V2.SETTINGS_VAT_CODES]),
  SETTINGS_CURRENCIES: createRoutePath([ROUTES_V2.SETTINGS, ROUTES_V2.SETTINGS_CURRENCIES]),
  SETTINGS_EVENT_CODES: createRoutePath([ROUTES_V2.SETTINGS, ROUTES_V2.SETTINGS_EVENT_CODES])
} as const

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Outlet />} path={ROUTES_V2.ROOT}>
      <Route element={<LayoutAuthPages />}>
        <Route element={<ViewLogin />} path={ROUTES_V2.AUTH_LOGIN} />
      </Route>

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

      {/* NOTE: unlock step by step if the specific view has been adjusted */}
      {/* with the layout changes */}
      <Route element={<LayoutAuth />}>
        <Route element={<ViewHome />} index />
        <Route element={<Outlet />} path={ROUTES_V2.TRANSACTIONS}>
          <Route
            element={
              // TODO: remove contexts when the related child components stop using it
              <RequirePermission resource="transactions" action="view">
                <BatchContextProvider>
                  <ViewTransactions />
                </BatchContextProvider>
              </RequirePermission>
            }
            index
          />
          <Route
            element={
              <RequirePermission resource="transactions" action="import_view">
                <ViewImport />
              </RequirePermission>
            }
            path={ROUTES_V2.TRANSACTIONS_IMPORT}
          />
          <Route
            element={
              // TODO: remove contexts when the related child components stop using it
              <BatchContextProvider>
                <TransactionsContextProvider>
                  <TransactionsReprocessContextProvider>
                    <ViewBatchesReview />
                  </TransactionsReprocessContextProvider>
                </TransactionsContextProvider>
              </BatchContextProvider>
            }
            path={ROUTES_V2.TRANSACTIONS_REVIEW}
          />
          {/* <Route element={null} path={ROUTES_V2.REVIEW_APPROVE} /> */}
          {/* <Route element={null} path={ROUTES_V2.REVIEW_PENDING} /> */}
          {/* <Route element={null} path={ROUTES_V2.REVIEW_INVALID} /> */}
          {/* <Route element={null} path={ROUTES_V2.REVIEW_APPROVED} /> */}
          <Route
            element={
              // TODO: remove contexts when the related child components stop using it
              <BatchPublishContextProvider>
                <TransactionsPublishContextProvider>
                  <ViewBatchesPublish />
                </TransactionsPublishContextProvider>
              </BatchPublishContextProvider>
            }
            path={ROUTES_V2.TRANSACTIONS_PUBLISH}
          />
          {/* <Route element={null} path={ROUTES_V2.PUBLISH_APPROVE} />
          <Route element={null} path={ROUTES_V2.PUBLISH_APPROVED} /> */}
          <Route
            element={
              <RequirePermission resource="transactions" action="reconcilate_view">
                <ViewReconciliation />
              </RequirePermission>
            }
            path={ROUTES_V2.TRANSACTIONS_RECONCILIATION}
          />
          {/* <Route element={null} path={ROUTES_V2.RECONCILIATION_UNDONE} /> */}
          {/* <Route element={null} path={ROUTES_V2.RECONCILIATION_DONE} /> */}
          <Route
            element={
              <RequirePermission resource="transactions" action="batches_view">
                <BatchContextProvider>
                  <ViewBatchesList />
                </BatchContextProvider>
              </RequirePermission>
            }
            path={ROUTES_V2.TRANSACTIONS_BATCHES}
          />
        </Route>
        <Route
          element={
            <RequirePermission resource="data_explorer" action="view">
              <Outlet />
            </RequirePermission>
          }
          path={ROUTES_V2.DATA_EXPLORER}
        >
          <Route element={<ViewDataExplorer />} index />
          <Route
            element={
              <RequirePermission resource="data_explorer" action="dashboard_view">
                <ViewDashboard />
              </RequirePermission>
            }
            path={ROUTES_V2.DATA_EXPLORER_DASHBOARD}
          />
          <Route
            element={
              <RequirePermission resource="data_explorer" action="dashboard_create">
                <ViewDashboardBuilder />
              </RequirePermission>
            }
            path={ROUTES_V2.DATA_EXPLORER_DASHBOARD_BUILDER}
          />
          <Route
            element={
              <RequirePermission resource="data_explorer" action="extraction_view">
                <ViewExtraction />
              </RequirePermission>
            }
            path={ROUTES_V2.DATA_EXPLORER_EXTRACTION}
          />
          <Route
            element={
              <RequirePermission resource="data_explorer" action="extraction_view">
                <ViewExtractionResults />
              </RequirePermission>
            }
            path={ROUTES_V2.DATA_EXPLORER_EXTRACTION_RESULTS}
          />
        </Route>

        <Route
          element={
            <RequirePermission resource="reports" action="view">
              <Outlet />
            </RequirePermission>
          }
          path={ROUTES_V2.REPORTING}
        >
          <Route element={<ViewReporting />} index />
          <Route
            element={
              <RequirePermission resource="reports" action="create">
                <ViewReportParameters />
              </RequirePermission>
            }
            path={ROUTES_V2.REPORTING_REPORT_PARAMETERS}
          />
          <Route
            element={
              <RequirePermission resource="reports" action="create">
                <ViewReportType />
              </RequirePermission>
            }
            path={ROUTES_V2.REPORTING_REPORT_TYPE}
          />
          <Route
            element={
              <RequirePermission resource="reports" action="publish_view">
                <ViewReportsPublish />
              </RequirePermission>
            }
            path={ROUTES_V2.REPORTING_PUBLISH}
          />
          <Route
            element={
              <RequirePermission resource="reports" action="view">
                <ViewReports />
              </RequirePermission>
            }
            path={ROUTES_V2.REPORTING_REPORTS}
          />
        </Route>

        <Route
          element={
            <RequirePermission resource="settings" action="view">
              <Outlet />
            </RequirePermission>
          }
          path={ROUTES_V2.SETTINGS}
        >
          <Route element={<ViewSettings />} index />
          <Route
            element={
              <RequirePermission resource="organization" action="view">
                <ViewOrganization />
              </RequirePermission>
            }
            path={ROUTES_V2.SETTINGS_ORGANIZATION}
          />
          <Route
            element={
              <RequirePermission resource="organization_setup" action="view">
                <ViewOrganizationSetup />
              </RequirePermission>
            }
            path={ROUTES_V2.SETTINGS_SETUP}
          />
          <Route
            element={
              <RequirePermission resource="organization_details" action="view">
                <ViewOrganizationDetails />
              </RequirePermission>
            }
            path={ROUTES_V2.SETTINGS_ORGANIZATION_DETAILS}
          />
          {/*<Route element={null} path={ROUTES_V2.SETTINGS_USER_MANAGEMENT} />*/}
          <Route
            element={
              <RequirePermission resource="chart_of_accounts" action="view">
                <ViewChartOfAccounts />
              </RequirePermission>
            }
            path={ROUTES_V2.SETTINGS_ACCOUNTS}
          />
          <Route
            element={
              <RequirePermission resource="cost_centers" action="view">
                <ViewCostCenters />
              </RequirePermission>
            }
            path={ROUTES_V2.SETTINGS_COST_CENTERS}
          />
          {/* <Route element={null} path={ROUTES_V2.SETTINGS_PROJECTS} /> */}
          <Route
            element={
              <RequirePermission resource="vat_codes" action="view">
                <ViewVatCodes />
              </RequirePermission>
            }
            path={ROUTES_V2.SETTINGS_VAT_CODES}
          />
          {/* <Route element={null} path={ROUTES_V2.SETTINGS_CURRENCIES} /> */}
          <Route
            element={
              <RequirePermission resource="event_codes" action="view">
                <ViewEventRefCodes />
              </RequirePermission>
            }
            path={ROUTES_V2.SETTINGS_EVENT_CODES}
          />
        </Route>
        <Route path="*" element={<ViewNotFound />} />
      </Route>
    </Route>
  )
)
