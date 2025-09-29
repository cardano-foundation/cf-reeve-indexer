import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'

const getAvailableMetricsQuery = async () => {
  const { metricsApi } = backendReeveApi()

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
