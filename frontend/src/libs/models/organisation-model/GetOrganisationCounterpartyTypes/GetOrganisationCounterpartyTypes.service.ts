import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { GetOrganisationCounterpartyTypesRequest } from 'libs/api-connectors/backend-connector-reeve/api/organisation/organisationApi.types'

const getOrganisationCounterpartyTypesQuery = async (request: GetOrganisationCounterpartyTypesRequest) => {
  const { organisationApi } = backendReeveApi()

  const data = await organisationApi.getOrganisationCounterpartyTypes(request)

  if (!data) return null

  return data
}

export const useGetOrganisationCounterpartyTypesModel = (request: GetOrganisationCounterpartyTypesRequest, isEnabled: boolean = true) => {
  const { data, isFetching } = useQuery({
    queryKey: ['ORGANISATION_COUNTERPARTY_TYPES', request.parameters.organisationId],
    queryFn: () => getOrganisationCounterpartyTypesQuery(request),
    enabled: isEnabled
  })

  return {
    counterpartyTypes: data ?? null,
    isCounterpartyTypesFetching: isFetching
  }
}
