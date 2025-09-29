import { useQuery, keepPreviousData } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { GetPublicTransactionsParameters, GetPublicTransactionsRequest } from 'libs/api-connectors/backend-connector-reeve/api/transactions/publicTransactionsApi.types.ts'

const getPublicTransactionsQuery = async (request: GetPublicTransactionsRequest, parameters: GetPublicTransactionsParameters) => {
  const { transactionsApi } = backendReeveApi()

  const data = await transactionsApi.getTransactions(request, parameters)

  if (!data) return null

  return data
}

export const useGetPublicTransactionsModel = (request: GetPublicTransactionsRequest, parameters: GetPublicTransactionsParameters) => {
  const { data, isFetching } = useQuery({
    queryKey: ['PUBLIC_TRANSACTIONS', request, parameters],
    queryFn: () => getPublicTransactionsQuery(request, parameters),
    placeholderData: keepPreviousData
  })

  return {
    transactions: data?.transactions ?? null,
    total: data?.total,
    isTransactionsFetching: isFetching
  }
}
