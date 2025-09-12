import { useQuery, keepPreviousData } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'
import { GetPublicTransactionsParameters, GetPublicTransactionsRequest } from 'libs/api-connectors/backend-connector-lob/api/public-transactions/publicTransactions.types.ts'

const getPublicTransactionsQuery = async (request: GetPublicTransactionsRequest, parameters: GetPublicTransactionsParameters) => {
  const { publicTransactionsApi } = backendLobApi()

  const data = await publicTransactionsApi.getPublicTransactions(request, parameters)

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
