import { batchesApi } from 'libs/api-connectors/backend-connector-lob/api/batches/batchesApi.ts'
import { chartOfAccountsApi } from 'libs/api-connectors/backend-connector-lob/api/chart-of-accounts/chartOfAccountsApi'
import { costCenterApi } from 'libs/api-connectors/backend-connector-lob/api/cost-centers/costCentersApi.ts'
import { dashboardsApi } from 'libs/api-connectors/backend-connector-lob/api/dashboards/dashboardsApi.ts'
import { eventCodesApi } from 'libs/api-connectors/backend-connector-lob/api/event-codes/eventCodesApi'
import { extractionApi } from 'libs/api-connectors/backend-connector-lob/api/extraction/extractionApi.ts'
import { metricsApi } from 'libs/api-connectors/backend-connector-lob/api/metrics/metricsApi.ts'
import { organisationApi } from 'libs/api-connectors/backend-connector-lob/api/organisation/organisationApi.ts'
import { publicTransactionsApi } from 'libs/api-connectors/backend-connector-lob/api/public-transactions/publicTransactions.ts'
import { reconciliationApi } from 'libs/api-connectors/backend-connector-lob/api/reconciliation/reconciliationApi.ts'
import { refCodesApi } from 'libs/api-connectors/backend-connector-lob/api/ref-codes/refCodesApi'
import { reportsApi } from 'libs/api-connectors/backend-connector-lob/api/reports/reportsApi.ts'
import { transactionsApi } from 'libs/api-connectors/backend-connector-lob/api/transactions/transactionsApi.ts'
import { vatCodesApi } from 'libs/api-connectors/backend-connector-lob/api/vat-codes/vatCodesApi.ts'
import { backendConfigurationLoB } from 'libs/api-connectors/backend-connector-lob/const/envs.ts'

export const backendLobApi = () => {
  const { apiUrl } = backendConfigurationLoB

  const parsedApiUrl = apiUrl ?? ''

  return {
    batchesApi: batchesApi(parsedApiUrl),
    dashboardsApi: dashboardsApi(parsedApiUrl),
    extractionApi: extractionApi(parsedApiUrl),
    metricsApi: metricsApi(parsedApiUrl),
    eventCodesApi: eventCodesApi(parsedApiUrl),
    refCodesApi: refCodesApi(parsedApiUrl),
    chartOfAccountsApi: chartOfAccountsApi(parsedApiUrl),
    costCentersApi: costCenterApi(parsedApiUrl),
    organisationApi: organisationApi(parsedApiUrl),
    reconciliationApi: reconciliationApi(parsedApiUrl),
    reportsApi: reportsApi(parsedApiUrl),
    publicTransactionsApi: publicTransactionsApi(parsedApiUrl),
    transactionsApi: transactionsApi(parsedApiUrl),
    vatCodesApi: vatCodesApi(parsedApiUrl)
  }
}
