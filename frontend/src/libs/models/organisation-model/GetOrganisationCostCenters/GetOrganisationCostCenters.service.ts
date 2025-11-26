import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { GetOrganisationCostCentersRequest } from 'libs/api-connectors/backend-connector-reeve/api/organisation/organisationApi.types'

const getOrganisationCostCentersQuery = async (request: GetOrganisationCostCentersRequest) => {
  const { organisationApi } = backendReeveApi()

  const data = await organisationApi.getOrganisationCostCenters(request)

  if (!data) return null

  return data
}

export const useGetOrganisationCostCentersModel = (request: GetOrganisationCostCentersRequest) => {
  const { data, isFetching } = useQuery({ queryKey: ['ORGANISATION_COST_CENTERS'], queryFn: () => getOrganisationCostCentersQuery(request) })

  return {
    costCenters: data ?? null,
    isCostCentersFetching: isFetching
  }
}
