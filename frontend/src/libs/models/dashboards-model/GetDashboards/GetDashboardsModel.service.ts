import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { GetDashboardsRequest } from 'libs/api-connectors/backend-connector-reeve/api/dashboards/dashboardsApi.types.ts'

const getDashboardsQuery = async (request: GetDashboardsRequest) => {
  const { dashboardsApi } = backendReeveApi()

  const data = await dashboardsApi.getDashboards(request)

  if (!data) return null

  return data
}

export const useGetDashboardsModel = (request: GetDashboardsRequest) => {
  const { data, isFetching } = useQuery({ queryKey: ['DASHBOARDS', request], queryFn: () => getDashboardsQuery(request) })

  return {
    dashboards: data ?? null,
    isDashboardsFetching: isFetching
  }
}
