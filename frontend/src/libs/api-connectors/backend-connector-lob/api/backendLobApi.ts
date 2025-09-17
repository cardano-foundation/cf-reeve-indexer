import { dashboardsApi } from 'libs/api-connectors/backend-connector-lob/api/dashboards/dashboardsApi.ts'
import { metricsApi } from 'libs/api-connectors/backend-connector-lob/api/metrics/metricsApi.ts'
import { organisationApi } from 'libs/api-connectors/backend-connector-lob/api/organisation/organisationApi.ts'
import { transactionsApi } from 'libs/api-connectors/backend-connector-lob/api/transactions/publicTransactions.ts'
import { reportsApi } from 'libs/api-connectors/backend-connector-lob/api/reports/publicReports'
import { backendConfigurationLoB } from 'libs/api-connectors/backend-connector-lob/const/envs.ts'

export const backendLobApi = () => {
  const { apiUrl } = backendConfigurationLoB

  const parsedApiUrl = apiUrl ?? ''

  return {
    dashboardsApi: dashboardsApi(parsedApiUrl),
    metricsApi: metricsApi(parsedApiUrl),
    organisationApi: organisationApi(parsedApiUrl),
    reportsApi: reportsApi(parsedApiUrl),
    publicTransactionsApi: transactionsApi(parsedApiUrl),
  }
}
