import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { GetOrganisationVatCodesRequest } from 'libs/api-connectors/backend-connector-reeve/api/organisation/organisationApi.types'

const getOrganisationVatCodesQuery = async (request: GetOrganisationVatCodesRequest) => {
  const { organisationApi } = backendReeveApi()

  const data = await organisationApi.getOrganisationVatCodes(request)

  if (!data) return null

  return data
}

export const useGetOrganisationVatCodesModel = (request: GetOrganisationVatCodesRequest, isEnabled: boolean = true) => {
  const { data, isFetching } = useQuery({
    queryKey: ['ORGANISATION_VAT_CODES', request.parameters.organisationId],
    queryFn: () => getOrganisationVatCodesQuery(request),
    enabled: isEnabled
  })

  return {
    vatCodes: data ?? null,
    isVatCodesFetching: isFetching
  }
}
