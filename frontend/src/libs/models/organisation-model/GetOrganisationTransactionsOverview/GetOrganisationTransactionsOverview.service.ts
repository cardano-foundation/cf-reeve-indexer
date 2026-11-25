import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { GetOrganisationTransactionsOverviewRequest } from 'libs/api-connectors/backend-connector-reeve/api/organisation/organisationApi.types'

const getOrganisationTransactionsOverviewQuery = async (request: GetOrganisationTransactionsOverviewRequest) => {
  const { organisationApi } = backendReeveApi()

  const data = await organisationApi.getOrganisationTransactionsOverview(request)

  if (!data) return null

  return data
}

export const useGetOrganisationTransactionsOverviewModel = (request: GetOrganisationTransactionsOverviewRequest, isEnabled: boolean = true) => {
  const { data, isFetching } = useQuery({
    queryKey: ['ORGANISATION_TRANSACTIONS_OVERVIEW', request.parameters.organisationId],
    queryFn: () => getOrganisationTransactionsOverviewQuery(request),
    enabled: isEnabled
  })

  return {
    transactionsOverview: data ?? null,
    isTransactionsOverviewFetching: isFetching
  }
}
