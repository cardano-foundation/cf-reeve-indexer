import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { GetOrganisationCounterpartiesRequest } from 'libs/api-connectors/backend-connector-reeve/api/organisation/organisationApi.types'

const getOrganisationCounterpartiesQuery = async (request: GetOrganisationCounterpartiesRequest) => {
  const { organisationApi } = backendReeveApi()

  const data = await organisationApi.getOrganisationCounterparties(request)

  if (!data) return null

  return data
}

export const useGetOrganisationCounterpartiesModel = (request: GetOrganisationCounterpartiesRequest, isEnabled: boolean = true) => {
  const { data, isFetching } = useQuery({
    queryKey: ['ORGANISATION_COUNTERPARTIES', request.parameters.organisationId],
    queryFn: () => getOrganisationCounterpartiesQuery(request),
    enabled: isEnabled
  })

  return {
    counterparties: data ?? null,
    isCounterpartiesFetching: isFetching
  }
}
