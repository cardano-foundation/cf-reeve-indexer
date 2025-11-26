import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { GetOrganisationCurrenciesRequest } from 'libs/api-connectors/backend-connector-reeve/api/organisation/organisationApi.types'

const getOrganisationCurrenciesQuery = async (request: GetOrganisationCurrenciesRequest) => {
  const { organisationApi } = backendReeveApi()

  const data = await organisationApi.getOrganisationCurrencies(request)

  if (!data) return null

  return data
}

export const useGetOrganisationCurrenciesModel = (request: GetOrganisationCurrenciesRequest) => {
  const { data, isFetching } = useQuery({ queryKey: ['ORGANISATION_CURRENCIES'], queryFn: () => getOrganisationCurrenciesQuery(request) })

  return {
    currencies: data ?? null,
    isCurrenciesFetching: isFetching
  }
}
