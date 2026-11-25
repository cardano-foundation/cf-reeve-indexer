import { cardsApi } from 'libs/api-connectors/backend-connector-reeve/api/cards/cardsApi'
import { ContractAPI } from 'libs/api-connectors/backend-connector-reeve/api/contracts/publicContractApi'
import { dashboardsApi } from 'libs/api-connectors/backend-connector-reeve/api/dashboards/dashboardsApi.ts'
import { documentsApi } from 'libs/api-connectors/backend-connector-reeve/api/documents/documentsApi'
import { eventsApi } from 'libs/api-connectors/backend-connector-reeve/api/events/publicEventsApi'
import { metricsApi } from 'libs/api-connectors/backend-connector-reeve/api/metrics/metricsApi.ts'
import { organisationApi } from 'libs/api-connectors/backend-connector-reeve/api/organisation/organisationApi.ts'
import { reportsApi } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi'
import { transactionsApi } from 'libs/api-connectors/backend-connector-reeve/api/transactions/publicTransactionsApi'
import { backendConfigurationLoB } from 'libs/api-connectors/backend-connector-reeve/const/envs.ts'

export const backendReeveApi = () => {
  const { apiUrl } = backendConfigurationLoB

  const parsedApiUrl = apiUrl ?? ''

  return {
    cardsApi: cardsApi(parsedApiUrl),
    dashboardsApi: dashboardsApi(parsedApiUrl),
    documentsApi: documentsApi(parsedApiUrl),
    eventsApi: eventsApi(parsedApiUrl),
    metricsApi: metricsApi(parsedApiUrl),
    organisationApi: organisationApi(parsedApiUrl),
    reportsApi: reportsApi(parsedApiUrl),
    transactionsApi: transactionsApi(parsedApiUrl),
    contractApi: ContractAPI(parsedApiUrl)
  }
}
