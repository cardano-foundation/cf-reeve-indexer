import { useQuery } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'
import { GetDashboardsRequest } from 'libs/api-connectors/backend-connector-lob/api/dashboards/dashboardsApi.types.ts'

const getDashboardsQuery = async (request: GetDashboardsRequest) => {
  const { dashboardsApi } = backendLobApi()

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
