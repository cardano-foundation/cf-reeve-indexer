import { useQuery } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'

const getAvailableMetricsQuery = async () => {
  const { metricsApi } = backendLobApi()

  const data = await metricsApi.getAvailableMetrics()

  if (!data) return null

  return data
}

export const useGetAvailableMetricsModel = () => {
  const { data, isFetching } = useQuery({ queryKey: ['AVAILABLE_METRICS'], queryFn: () => getAvailableMetricsQuery() })

  return {
    availableMetrics: data ?? null,
    isAvailableMetricsFetching: isFetching
  }
}
