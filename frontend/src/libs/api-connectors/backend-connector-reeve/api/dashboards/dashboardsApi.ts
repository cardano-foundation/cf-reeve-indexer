import {
  GetDashboardsRequest,
  GetDashboardsResponse200,
  SaveDashboardRequest,
  UpdateDashboardRequest
} from 'libs/api-connectors/backend-connector-reeve/api/dashboards/dashboardsApi.types.ts'
import { httpService } from 'libs/api-connectors/backend-connector-reeve/api/httpService.ts'

export const dashboardsApi = (baseUrl: string) => {
  const { post, get } = httpService(baseUrl)

  const getDashboards = (request: GetDashboardsRequest) => {
    return get<GetDashboardsResponse200>(`api/v1/metrics/dashboards/${request.organisationId}`, null, { Authorization: '' })
  }

  const saveDashboard = (request: SaveDashboardRequest) => {
    return post<true, SaveDashboardRequest>('api/v1/metrics/saveDashboard', request)
  }

  const updateDashboard = (request: UpdateDashboardRequest) => {
    return post<true, UpdateDashboardRequest>('api/v1/metrics/updateDashboard', request)
  }

  return {
    getDashboards,
    saveDashboard,
    updateDashboard
  }
}
