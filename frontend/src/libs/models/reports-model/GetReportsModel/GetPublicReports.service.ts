import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { GetPublicReportsRequest } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types'

const getPublicReportsQuery = async (parameters: GetPublicReportsRequest) => {
  const { reportsApi } = backendReeveApi()

  const data = await reportsApi.getPublicReports({ ...parameters })

  if (!data) return null

  return data
}

export const useGetPublicReportsModel = (parameters: GetPublicReportsRequest) => {
  const { data, refetch, isFetching } = useQuery({
    queryKey: ['PUBLIC_REPORTS', parameters],
    queryFn: () => getPublicReportsQuery({ ...parameters })
  })

  return {
    reports: data ?? null,
    isFetching,
    refetch
  }
}
