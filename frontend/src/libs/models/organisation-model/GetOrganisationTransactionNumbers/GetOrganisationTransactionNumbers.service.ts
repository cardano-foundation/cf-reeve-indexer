import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { GetOrganisationTransactionNumbersRequest } from 'libs/api-connectors/backend-connector-reeve/api/organisation/organisationApi.types'

const getOrganisationTransactionNumbersQuery = async (request: GetOrganisationTransactionNumbersRequest) => {
  const { organisationApi } = backendReeveApi()

  const data = await organisationApi.getOrganisationInternalNumbers(request)

  if (!data) return null

  return data
}

export const useGetOrganisationTransactionNumbersModel = (request: GetOrganisationTransactionNumbersRequest, isEnabled: boolean = true) => {
  const { data, isFetching } = useQuery({
    queryKey: ['ORGANISATION_TRANSACTION_NUMBERS', request.parameters.organisationId, request.parameters.number],
    queryFn: () => getOrganisationTransactionNumbersQuery(request),
    enabled: isEnabled && !!request.parameters.number
  })

  return {
    transactionNumbers: data ?? null,
    isTransactionNumbersFetching: isFetching
  }
}
