import { useQuery } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'
import { GetReportsRequest } from 'libs/api-connectors/backend-connector-lob/api/reports/publicReports.types'

const getReportsQuery = async (parameters: GetReportsRequest) => {
  const { reportsApi } = backendLobApi()

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
