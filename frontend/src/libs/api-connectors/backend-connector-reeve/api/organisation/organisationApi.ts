import { httpService } from 'libs/api-connectors/backend-connector-reeve/api/httpService.ts'
import {
  GetOrganisationCostCentersRequest,
  GetOrganisationCostCentersResponse200,
  GetOrganisationCounterpartiesRequest,
  GetOrganisationCounterpartiesResponse200,
  GetOrganisationCounterpartyTypesRequest,
  GetOrganisationCounterpartyTypesResponse200,
  GetOrganisationCurrenciesRequest,
  GetOrganisationCurrenciesResponse200,
  GetOrganisationDocumentNumbersRequest,
  GetOrganisationDocumentNumbersResponse200,
  GetOrganisationEventsRequest,
  GetOrganisationEventsResponse200,
  GetOrganisationProjectsRequest,
  GetOrganisationProjectsResponse200,
  GetOrganisationsResponse200,
  GetOrganisationTransactionNumbersRequest,
  GetOrganisationTransactionNumbersResponse200,
  GetOrganisationTransactionTypesRequest,
  GetOrganisationTransactionTypesResponse200,
  GetOrganisationVatCodesRequest,
  GetOrganisationVatCodesResponse200
} from 'libs/api-connectors/backend-connector-reeve/api/organisation/organisationApi.types.ts'

export const organisationApi = (baseUrl: string) => {
  const { get } = httpService(baseUrl)

  const getOrganisations = ({ hasAuthorizationHeader = true }: { hasAuthorizationHeader?: boolean } = {}) => {
    return get<GetOrganisationsResponse200>(`api/v1/organisations`, null, !hasAuthorizationHeader ? { Authorization: '' } : undefined)
  }

  const getOrganisationCostCenters = (request: GetOrganisationCostCentersRequest) => {
    const {
      parameters: { organisationId }
    } = request

    return get<GetOrganisationCostCentersResponse200>(`api/v1/organisations/${organisationId}/costCenter`)
  }

  const getOrganisationCounterparties = (request: GetOrganisationCounterpartiesRequest) => {
    const {
      parameters: { organisationId }
    } = request

    return get<GetOrganisationCounterpartiesResponse200>(`api/v1/organisations/${organisationId}/counterParty`)
  }

  const getOrganisationCounterpartyTypes = (request: GetOrganisationCounterpartyTypesRequest) => {
    const {
      parameters: { organisationId }
    } = request

    return get<GetOrganisationCounterpartyTypesResponse200>(`api/v1/organisations/${organisationId}/counterPartyType`)
  }

  const getOrganisationCurrencies = (request: GetOrganisationCurrenciesRequest) => {
    const {
      parameters: { organisationId }
    } = request

    return get<GetOrganisationCurrenciesResponse200>(`api/v1/organisations/${organisationId}/currencies`)
  }

  const getOrganisationDocumentNumbers = (request: GetOrganisationDocumentNumbersRequest) => {
    const {
      parameters: { organisationId }
    } = request

    return get<GetOrganisationDocumentNumbersResponse200>(`api/v1/organisations/${organisationId}/documentNumber`)
  }

  const getOrganisationEvents = (request: GetOrganisationEventsRequest) => {
    const {
      parameters: { organisationId }
    } = request

    return get<GetOrganisationEventsResponse200>(`api/v1/organisations/${organisationId}/events`)
  }

  const getOrganisationInternalNumbers = (request: GetOrganisationTransactionNumbersRequest) => {
    const {
      parameters: { organisationId }
    } = request

    return get<GetOrganisationTransactionNumbersResponse200>(`api/v1/organisations/${organisationId}/internalNumber`)
  }

  const getOrganisationProjects = (request: GetOrganisationProjectsRequest) => {
    const {
      parameters: { organisationId }
    } = request

    return get<GetOrganisationProjectsResponse200>(`api/v1/organisations/${organisationId}/projects`)
  }

  const getOrganisationTransactionTypes = (request: GetOrganisationTransactionTypesRequest) => {
    const {
      parameters: { organisationId }
    } = request

    return get<GetOrganisationTransactionTypesResponse200>(`api/v1/organisations/${organisationId}/transactionType`)
  }

  const getOrganisationVatCodes = (request: GetOrganisationVatCodesRequest) => {
    const {
      parameters: { organisationId }
    } = request

    return get<GetOrganisationVatCodesResponse200>(`api/v1/organisations/${organisationId}/vatCode`)
  }

  return {
    getOrganisations,
    getOrganisationCostCenters,
    getOrganisationCounterparties,
    getOrganisationCounterpartyTypes,
    getOrganisationCurrencies,
    getOrganisationDocumentNumbers,
    getOrganisationEvents,
    getOrganisationInternalNumbers,
    getOrganisationProjects,
    getOrganisationTransactionTypes,
    getOrganisationVatCodes
  }
}
