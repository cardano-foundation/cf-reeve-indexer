import {
  GetDashboardsRequest,
  GetDashboardsResponse200,
} from 'libs/api-connectors/backend-connector-reeve/api/dashboards/dashboardsApi.types.ts'
import { httpService } from 'libs/api-connectors/backend-connector-reeve/api/httpService.ts'

export const dashboardsApi = (baseUrl: string) => {
  const { get } = httpService(baseUrl)

  const getDashboards = (request: GetDashboardsRequest) => {
    return get<GetDashboardsResponse200>(`api/v1/metrics/dashboards/${request.organisationId}`, null, { Authorization: '' })
  }

  return {
    getDashboards,
  }
}
