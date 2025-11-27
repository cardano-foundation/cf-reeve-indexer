import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { GetPublicReportsRequest } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types'

const getPublicReportsQuery = async (request: GetPublicReportsRequest) => {
  const { reportsApi } = backendReeveApi()

  const data = await reportsApi.getPublicReports(request)

  if (!data) return null

  return data
}

export const useGetPublicReportsModel = (request: GetPublicReportsRequest, dependencies: unknown[] = [], isEnabled: boolean = true) => {
  const { data, refetch, isFetching } = useQuery({
    queryKey: ['PUBLIC_REPORTS', ...dependencies],
    queryFn: () => getPublicReportsQuery(request),
    enabled: isEnabled,
    retry: false,
    placeholderData: keepPreviousData
  })

  return {
    reports: data ?? null,
    isFetching,
    refetch
  }
}
