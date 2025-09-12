import { useQuery } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'

const getOrganisationChartTypesQuery = async ({ id }: { id: string }) => {
  const { organisationApi } = backendLobApi()

  const data = await organisationApi.getOrganisationChartTypes({ id })

  if (!data) return null

  return data
}

export const useGetOrganisationChartTypesModel = ({ id }: { id: string }) => {
  const { data, isFetching } = useQuery({ queryKey: ['ORGANISATION_CHART_TYPES'], queryFn: () => getOrganisationChartTypesQuery({ id }) })

  return {
    organisationChartTypes: data ?? [],
    isOrganisationChartTypesFetching: isFetching
  }
}
