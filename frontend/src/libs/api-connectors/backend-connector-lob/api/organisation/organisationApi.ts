import { httpService } from 'libs/api-connectors/backend-connector-lob/api/httpService.ts'
import {
  CurrenciesApiResponse,
  OrganisationApiResponse,
  OrganisationsApiResponse
} from 'libs/api-connectors/backend-connector-lob/api/organisation/organisationApi.types.ts'

export const organisationApi = (baseUrl: string) => {
  const { get } = httpService(baseUrl)

  const getOrganisations = ({ hasAuthorizationHeader = true }: { hasAuthorizationHeader?: boolean } = {}) => {
    return get<OrganisationsApiResponse>(`api/v1/organisations`, null, !hasAuthorizationHeader ? { Authorization: '' } : undefined)
  }

  const getOrganisation = ({ id }: { id: string }) => {
    return get<OrganisationApiResponse>(`api/v1/organisations/${id}`)
  }

  const getCurrencies = (id: string) => {
    return get<CurrenciesApiResponse>(`api/v1/organisations/${id}/currencies`, null, { Authorization: '' })
  }

  return {
    getOrganisations,
    getOrganisation,
    getCurrencies,
  }
}
