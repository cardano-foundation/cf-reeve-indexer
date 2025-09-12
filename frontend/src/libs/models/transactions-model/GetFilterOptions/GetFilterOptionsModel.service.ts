import { useQuery } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'
import { GetFilterOptionsRequest } from 'libs/api-connectors/backend-connector-lob/api/transactions/transactionsApi.types.ts'

const getFilterOptionsQuery = async (request: GetFilterOptionsRequest) => {
  const { transactionsApi } = backendLobApi()

  const data = await transactionsApi.getFilterOptions(request)

  if (!data) return null

  return data
}

export const useGetFilterOptionsModel = (request: GetFilterOptionsRequest) => {
  const { data, isFetching } = useQuery({ queryKey: ['FILTER_OPTIONS', request], queryFn: () => getFilterOptionsQuery(request) })

  return {
    filterOptions: data?.filterOptions ?? null,
    isFetching
  }
}
