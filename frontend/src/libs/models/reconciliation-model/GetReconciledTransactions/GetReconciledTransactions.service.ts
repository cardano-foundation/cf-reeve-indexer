import { useQuery } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'
import {
  GetReconciledTransactionsApiParameters,
  GetReconciledTransactionsApiRequest
} from 'libs/api-connectors/backend-connector-lob/api/reconciliation/reconciliationApi.types.ts'

const getReconciledTransactionsQuery = async (request: GetReconciledTransactionsApiRequest, parameters?: GetReconciledTransactionsApiParameters) => {
  const { reconciliationApi } = backendLobApi()

  const data = await reconciliationApi.getReconciledTransactions(request, parameters)

  if (!data) return null

  return data
}

export const useGetReconciledTransactionsModel = (request: GetReconciledTransactionsApiRequest, parameters?: GetReconciledTransactionsApiParameters) => {
  const { data, isFetching, refetch } = useQuery({
    queryKey: ['TRANSACTIONS_RECONCILE', request.filter, parameters],
    queryFn: () => getReconciledTransactionsQuery(request, parameters)
  })

  return {
    reconciledTransactions: data ?? null,
    isFetching,
    refetch
  }
}
