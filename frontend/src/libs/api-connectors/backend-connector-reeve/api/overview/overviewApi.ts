import { httpService } from 'libs/api-connectors/backend-connector-reeve/api/httpService.ts'
import { GetDashboardOverviewRequest, GetDashboardOverviewResponse200 } from 'libs/api-connectors/backend-connector-reeve/api/overview/overviewApi.types.ts'

export const overviewApi = (baseUrl: string) => {
  const { get } = httpService(baseUrl)

  const getDashboardOverview = (request: GetDashboardOverviewRequest) => {
    const {
      parameters: { organisationId }
    } = request

    const queryString = organisationId ? `?organisationId=${encodeURIComponent(organisationId)}` : ''

    return get<GetDashboardOverviewResponse200>(`api/v1/dashboard/overview${queryString}`, null, { Authorization: '' })
  }

  return {
    getDashboardOverview
  }
}
