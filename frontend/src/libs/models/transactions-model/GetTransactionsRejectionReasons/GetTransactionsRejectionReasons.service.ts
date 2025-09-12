import { useQuery } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'

const getTransactionsRejectionReasonsQuery = async () => {
  const { transactionsApi } = backendLobApi()

  const data = await transactionsApi.getTransactionsRejectionReasons()

  if (!data) return null

  return data
}

export const useGetTransactionsRejectionReasonsModel = () => {
  const { data, isFetching } = useQuery({ queryKey: ['TRANSACTIONS_REJECTION_REASONS'], queryFn: () => getTransactionsRejectionReasonsQuery() })

  return {
    transactionsRejectionReasons: data ?? null,
    isFetching
  }
}
