import { httpService } from 'libs/api-connectors/backend-connector-lob/api/httpService.ts'
import { GetAvailableMetricsResponse200, GetMetricsRequest, GetMetricsResponse200 } from 'libs/api-connectors/backend-connector-lob/api/metrics/metricsApi.types.ts'

export const metricsApi = (baseUrl: string) => {
  const { post, get } = httpService(baseUrl)

  const getAvailableMetrics = () => {
    return get<GetAvailableMetricsResponse200>('api/v1/metrics/availableMetrics', null, { Authorization: '' })
  }

  const getMetrics = (request: GetMetricsRequest) => {
    return post<GetMetricsResponse200, GetMetricsRequest>('api/v1/metrics/data', request, { Authorization: '' })
  }

  return {
    getAvailableMetrics,
    getMetrics
  }
}
