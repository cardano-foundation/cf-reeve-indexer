import { hasPermission } from 'libs/permissions/has-permission'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { PATHS } from 'routes'

export const useNavigationRoutes = () => {
  const { t } = useTranslations()

  const TRANSACTIONS_ROUTES = [
    { label: t({ id: 'import' }), route: PATHS.TRANSACTIONS_IMPORT, enabled: hasPermission('transactions', 'import_view') },
    { label: t({ id: 'review' }), route: PATHS.TRANSACTIONS_REVIEW, enabled: hasPermission('transactions', 'review_view') },
    { label: t({ id: 'publish' }), route: PATHS.TRANSACTIONS_PUBLISH, enabled: hasPermission('transactions', 'publish_view') },
    { label: t({ id: 'allBatches' }), route: PATHS.TRANSACTIONS_BATCHES, enabled: hasPermission('transactions', 'batches_view') },
    { label: t({ id: 'reconciliation' }), route: PATHS.TRANSACTIONS_RECONCILIATION, enabled: hasPermission('transactions', 'reconcilate_view') }
  ].filter((route) => route.enabled)

  const DATA_EXPLORER_ROUTES = [
    { label: t({ id: 'dashboard' }), route: PATHS.DATA_EXPLORER_DASHBOARD, enabled: hasPermission('data_explorer', 'dashboard_view') },
    { label: t({ id: 'extraction' }), route: PATHS.DATA_EXPLORER_EXTRACTION, enabled: hasPermission('data_explorer', 'extraction_view') }
  ].filter((route) => route.enabled)

  const REPORTING_ROUTES = [
    { label: t({ id: 'report' }), route: PATHS.REPORTING_REPORT_PARAMETERS, enabled: hasPermission('reports', 'create') },
    { label: t({ id: 'publish' }), route: PATHS.REPORTING_PUBLISH, enabled: hasPermission('reports', 'publish_view') },
    { label: t({ id: 'allReports' }), route: PATHS.REPORTING_REPORTS, enabled: hasPermission('reports', 'view') }
  ].filter((route) => route.enabled)

  // TODO: uncomment one by one based on the tasks
  const SETTINGS_ROUTES = [
    { label: t({ id: 'organizationSetup' }), route: PATHS.SETTINGS_SETUP, group: t({ id: 'organization' }), enabled: hasPermission('organization_setup', 'view') },
    {
      label: t({ id: 'organizationDetails' }),
      route: PATHS.SETTINGS_ORGANIZATION_DETAILS,
      group: t({ id: 'organization' }),
      enabled: hasPermission('organization_details', 'view')
    },
    // { label: t({ id: 'userManagement' }), route: PATHS.SETTINGS_USER_MANAGEMENT },
    { label: t({ id: 'chartOfAccounts' }), route: PATHS.SETTINGS_ACCOUNTS, group: t({ id: 'organization' }), enabled: hasPermission('chart_of_accounts', 'view') },
    { label: t({ id: 'costCenters' }), route: PATHS.SETTINGS_COST_CENTERS, group: t({ id: 'organization' }), enabled: hasPermission('cost_centers', 'view') },
    // { label: t({ id: 'projects' }), route: PATHS.SETTINGS_PROJECTS },
    { label: t({ id: 'vatCodes' }), route: PATHS.SETTINGS_VAT_CODES, group: t({ id: 'organization' }), enabled: hasPermission('vat_codes', 'view') },
    // { label: t({ id: 'currencies' }), route: PATHS.SETTINGS_CURRENCIES },
    { label: t({ id: 'eventCodes' }), route: PATHS.SETTINGS_EVENT_CODES, group: t({ id: 'organization' }), enabled: hasPermission('event_codes', 'view') }
  ].filter((route) => route.enabled)

  return { TRANSACTIONS_ROUTES, DATA_EXPLORER_ROUTES, REPORTING_ROUTES, SETTINGS_ROUTES }
}
