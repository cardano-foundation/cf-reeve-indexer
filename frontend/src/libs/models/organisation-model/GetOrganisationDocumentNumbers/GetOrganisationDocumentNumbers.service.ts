import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { GetOrganisationDocumentNumbersRequest } from 'libs/api-connectors/backend-connector-reeve/api/organisation/organisationApi.types'

const getOrganisationDocumentNumbersQuery = async (request: GetOrganisationDocumentNumbersRequest) => {
  const { organisationApi } = backendReeveApi()

  const data = await organisationApi.getOrganisationDocumentNumbers(request)

  if (!data) return null

  return data
}

export const useGetOrganisationDocumentNumbersModel = (request: GetOrganisationDocumentNumbersRequest) => {
  const { data, isFetching } = useQuery({ queryKey: ['ORGANISATION_DOCUMENT_NUMBERS'], queryFn: () => getOrganisationDocumentNumbersQuery(request) })

  return {
    documentNumbers: data ?? null,
    isDocumentNumbersFetching: isFetching
  }
}
