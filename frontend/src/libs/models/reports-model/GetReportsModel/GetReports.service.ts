import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { GetReportsRequest } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types'

const getReportsQuery = async (parameters: GetReportsRequest) => {
  const { reportsApi } = backendReeveApi()

  const data = await reportsApi.getReports({ ...parameters })

  if (!data) return null

  return data
}

export const useGetReportsModel = (parameters: GetReportsRequest) => {
  const { data, refetch, isFetching } = useQuery({
    queryKey: ['REPORTS'],
    queryFn: () => getReportsQuery({ ...parameters })
  })

  return {
    reports: data ?? null,
    isFetching,
    refetch
  }
}
