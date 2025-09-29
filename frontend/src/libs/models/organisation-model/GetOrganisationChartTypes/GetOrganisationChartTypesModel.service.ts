import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'

const getOrganisationChartTypesQuery = async ({ id }: { id: string }) => {
  const { organisationApi } = backendReeveApi()

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
