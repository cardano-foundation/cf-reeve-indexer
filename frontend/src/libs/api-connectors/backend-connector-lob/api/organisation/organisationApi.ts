import { httpService } from 'libs/api-connectors/backend-connector-lob/api/httpService.ts'
import {
  CurrenciesApiResponse,
  OrganisationApiResponse,
  OrganisationChartTypesApiResponse200,
  OrganisationCostCentersApiResponse200,
  OrganisationProjectsApiResponse200,
  OrganisationsApiResponse
} from 'libs/api-connectors/backend-connector-lob/api/organisation/organisationApi.types.ts'

export const organisationApi = (baseUrl: string) => {
  const { get, put } = httpService(baseUrl)

  const getOrganisations = ({ hasAuthorizationHeader = true }: { hasAuthorizationHeader?: boolean } = {}) => {
    return get<OrganisationsApiResponse>(`api/v1/organisations`, null, !hasAuthorizationHeader ? { Authorization: '' } : undefined)
  }

  const getOrganisation = ({ id }: { id: string }) => {
    return get<OrganisationApiResponse>(`api/v1/organisations/${id}`)
  }

  const getOrganisationChartTypes = ({ id }: { id: string }) => {
    return get<OrganisationChartTypesApiResponse200>(`api/v1/organisations/${id}/chart-types`)
  }

  const getOrganisationCostCenters = ({ id }: { id: string }) => {
    return get<OrganisationCostCentersApiResponse200>(`api/v1/organisations/${id}/cost-centers`)
  }

  const getOrganisationProjects = ({ id }: { id: string }) => {
    return get<OrganisationProjectsApiResponse200>(`api/v1/organisations/${id}/projects`)
  }

  const updateOrganisation = ({ payload }: { payload: Partial<OrganisationApiResponse> }) => {
    const { id, ...data } = payload

    return put<OrganisationApiResponse, Partial<OrganisationApiResponse>>(`api/v1/organisations/${id}`, data)
  }

  const getCurrencies = (id: string) => {
    return get<CurrenciesApiResponse>(`api/v1/organisations/${id}/currencies`, null, { Authorization: '' })
  }

  return {
    getOrganisations,
    getOrganisation,
    getOrganisationChartTypes,
    getOrganisationCostCenters,
    getOrganisationProjects,
    updateOrganisation,
    getCurrencies
  }
}
