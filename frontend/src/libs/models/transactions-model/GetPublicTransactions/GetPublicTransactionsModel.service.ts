import { useQuery, keepPreviousData } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { PostPublicTransactionsRequest } from 'libs/api-connectors/backend-connector-reeve/api/transactions/publicTransactionsApi.types.ts'

const getPublicTransactionsQuery = async (request: PostPublicTransactionsRequest) => {
  const { transactionsApi } = backendReeveApi()

  const data = await transactionsApi.getTransactions(request)

  if (!data) return null

  return data
}

export const useGetPublicTransactionsModel = (request: PostPublicTransactionsRequest, dependencies: unknown[] = [], isEnabled: boolean = true) => {
  const { data, isFetching } = useQuery({
    queryKey: ['PUBLIC_TRANSACTIONS', ...dependencies],
    queryFn: () => getPublicTransactionsQuery(request),
    enabled: isEnabled,
    retry: false,
    placeholderData: keepPreviousData
  })

  return {
    transactions: data ?? null,
    isTransactionsFetching: isFetching
  }
}
