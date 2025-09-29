import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { GetFilterOptionsRequest } from 'libs/api-connectors/backend-connector-reeve/api/transactions/transactionsApi.types.ts'

const getFilterOptionsQuery = async (request: GetFilterOptionsRequest) => {
  const { transactionsApi } = backendReeveApi()

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
