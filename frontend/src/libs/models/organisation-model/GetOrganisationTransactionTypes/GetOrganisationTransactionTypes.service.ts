import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { GetOrganisationTransactionTypesRequest } from 'libs/api-connectors/backend-connector-reeve/api/organisation/organisationApi.types'

const getOrganisationTransactionTypesQuery = async (request: GetOrganisationTransactionTypesRequest) => {
  const { organisationApi } = backendReeveApi()

  const data = await organisationApi.getOrganisationTransactionTypes(request)

  if (!data) return null

  return data
}

export const useGetOrganisationTransactionTypesModel = (request: GetOrganisationTransactionTypesRequest, isEnabled: boolean = true) => {
  const { data, isFetching } = useQuery({
    queryKey: ['ORGANISATION_TRANSACTION_TYPES', request.parameters.organisationId],
    queryFn: () => getOrganisationTransactionTypesQuery(request),
    enabled: isEnabled
  })

  return {
    transactionTypes: data ?? null,
    isTransactionTypesFetching: isFetching
  }
}
