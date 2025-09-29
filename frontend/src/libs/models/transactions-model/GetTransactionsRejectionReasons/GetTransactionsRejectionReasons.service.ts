import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'

const getTransactionsRejectionReasonsQuery = async () => {
  const { transactionsApi } = backendReeveApi()

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
