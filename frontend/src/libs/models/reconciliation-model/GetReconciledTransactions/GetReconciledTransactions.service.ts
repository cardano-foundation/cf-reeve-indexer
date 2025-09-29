import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import {
  GetReconciledTransactionsApiParameters,
  GetReconciledTransactionsApiRequest
} from 'libs/api-connectors/backend-connector-reeve/api/reconciliation/reconciliationApi.types.ts'

const getReconciledTransactionsQuery = async (request: GetReconciledTransactionsApiRequest, parameters?: GetReconciledTransactionsApiParameters) => {
  const { reconciliationApi } = backendReeveApi()

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
