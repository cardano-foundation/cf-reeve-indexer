import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { GetOrganisationCostCentersRequest } from 'libs/api-connectors/backend-connector-reeve/api/organisation/organisationApi.types'

const getOrganisationCostCentersQuery = async (request: GetOrganisationCostCentersRequest) => {
  const { organisationApi } = backendReeveApi()

  const data = await organisationApi.getOrganisationCostCenters(request)

  if (!data) return null

  return data
}

export const useGetOrganisationCostCentersModel = (request: GetOrganisationCostCentersRequest, isEnabled: boolean = true) => {
  const { data, isFetching } = useQuery({
    queryKey: ['ORGANISATION_COST_CENTERS', request.parameters.organisationId],
    queryFn: () => getOrganisationCostCentersQuery(request),
    enabled: isEnabled
  })

  return {
    costCenters: data ?? null,
    isCostCentersFetching: isFetching
  }
}
