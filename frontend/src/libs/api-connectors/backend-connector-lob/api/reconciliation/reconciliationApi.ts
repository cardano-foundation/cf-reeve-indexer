import {
  GetReconciledTransactionsApiParameters,
  GetReconciledTransactionsApiRequest,
  GetReconciledTransactionsApiResponse,
  TriggerReconciliationApiRequest,
  TriggerReconciliationApiResponse
} from 'libs/api-connectors/backend-connector-lob/api/reconciliation/reconciliationApi.types.ts'

import { httpService } from '../httpService'

export const reconciliationApi = (baseUrl: string) => {
  const { post } = httpService(baseUrl)

  const triggerReconciliation = (request: TriggerReconciliationApiRequest) => {
    return post<TriggerReconciliationApiResponse, TriggerReconciliationApiRequest>('api/v1/reconcile/trigger', request)
  }

  const getReconciledTransactions = (request: GetReconciledTransactionsApiRequest, parameters?: GetReconciledTransactionsApiParameters) => {
    return post<GetReconciledTransactionsApiResponse, GetReconciledTransactionsApiRequest>(
      `api/v1/transactions-reconcile?page=${parameters?.page ?? 0}&size=${parameters?.size ?? 10}`,
      request
    )
  }

  return {
    triggerReconciliation,
    getReconciledTransactions
  }
}
