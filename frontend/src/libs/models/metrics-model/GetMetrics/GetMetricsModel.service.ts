import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { GetMetricsRequest } from 'libs/api-connectors/backend-connector-reeve/api/metrics/metricsApi.types.ts'

const getMetricsQuery = async (request: GetMetricsRequest) => {
  const { metricsApi } = backendReeveApi()

  const data = await metricsApi.getMetrics(request)

  if (!data) return null

  return data
}

export const useGetMetricsModel = (request: GetMetricsRequest, isEnabled = false) => {
  const { data, isFetching } = useQuery({ queryKey: ['METRICS', request], queryFn: () => getMetricsQuery(request), enabled: isEnabled })

  return {
    metrics: data ?? null,
    isMetricsFetching: isFetching
  }
}
