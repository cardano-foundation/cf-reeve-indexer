import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { GetOrganisationAccountingRegimesRequest } from 'libs/api-connectors/backend-connector-reeve/api/organisation/organisationApi.types'

const getOrganisationAccountingRegimesQuery = async (request: GetOrganisationAccountingRegimesRequest) => {
  const { organisationApi } = backendReeveApi()

  const data = await organisationApi.getOrganisationAccountingRegimes(request)

  if (!data) return null

  return data
}

export const useGetOrganisationAccountingRegimesModel = (request: GetOrganisationAccountingRegimesRequest, isEnabled: boolean = true) => {
  const { data, isFetching } = useQuery({
    queryKey: ['ORGANISATION_ACCOUNTING_REGIMES', request.parameters.organisationId],
    queryFn: () => getOrganisationAccountingRegimesQuery(request),
    enabled: isEnabled
  })

  return {
    accountingRegimes: data ?? null,
    isAccountingRegimesFetching: isFetching
  }
}
