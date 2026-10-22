import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { GetDashboardOverviewRequest } from 'libs/api-connectors/backend-connector-reeve/api/overview/overviewApi.types.ts'

const getDashboardOverviewQuery = async (request: GetDashboardOverviewRequest) => {
  const { overviewApi } = backendReeveApi()

  const data = await overviewApi.getDashboardOverview(request)

  if (!data) return null

  return data
}

export const useGetDashboardOverviewModel = (organisationId?: string) => {
  const { data, isFetching, isError } = useQuery({
    queryKey: ['DASHBOARD_OVERVIEW', organisationId ?? 'ALL'],
    queryFn: () => getDashboardOverviewQuery({ parameters: { organisationId } }),
    retry: false,
    placeholderData: keepPreviousData
  })

  return {
    overview: data ?? null,
    isOverviewFetching: isFetching,
    isOverviewError: isError
  }
}
