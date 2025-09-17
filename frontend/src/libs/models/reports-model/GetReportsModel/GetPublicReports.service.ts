import { useQuery } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'
import { GetPublicReportsRequest } from 'libs/api-connectors/backend-connector-lob/api/reports/publicReports.types'

const getPublicReportsQuery = async (parameters: GetPublicReportsRequest) => {
  const { reportsApi } = backendLobApi()

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
