interface OrganisationEntityRequestParameters {
  organisationId: string
}

interface OrganisationEntityRequest {
  parameters: OrganisationEntityRequestParameters
}

export interface OrganisationEntity {
  id: string
  name: string
  currency_id: string
  country_code: string
  tax_id_number: string
}

export type OrganisationCostCenterEntity = string

export type OrganisationCounterpartyEntity = string

export type OrganisationCounterpartyTypeEntity = string

export interface OrganisationCurrencyEntity {
  currencyId: string
  customerCode: string
}

export type OrganisationDocumentNumberEntity = string

export type OrganisationEventEntity = string

export interface OrganisationProjectEntity {
  projectCustCode: string
  projectName: string
}

export type OrganisationTransactionNumberEntity = string

export type OrganisationTransactionTypeEntity = string

export type OrganisationVatCodeEntity = string

export type GetOrganisationsResponse200 = OrganisationEntity[]

export type GetOrganisationCostCentersRequest = OrganisationEntityRequest

export type GetOrganisationCostCentersResponse200 = OrganisationCostCenterEntity[]

export type GetOrganisationCounterpartiesRequest = OrganisationEntityRequest

export type GetOrganisationCounterpartiesResponse200 = OrganisationCounterpartyEntity[]

export type GetOrganisationCounterpartyTypesRequest = OrganisationEntityRequest

export type GetOrganisationCounterpartyTypesResponse200 = OrganisationCounterpartyTypeEntity[]

export type GetOrganisationCurrenciesRequest = OrganisationEntityRequest

export type GetOrganisationCurrenciesResponse200 = OrganisationCurrencyEntity[]

export type GetOrganisationDocumentNumbersRequest = OrganisationEntityRequest

export type GetOrganisationDocumentNumbersResponse200 = OrganisationDocumentNumberEntity[]

export type GetOrganisationEventsRequest = OrganisationEntityRequest

export type GetOrganisationEventsResponse200 = OrganisationEventEntity[]

export type GetOrganisationProjectsRequest = OrganisationEntityRequest

export type GetOrganisationProjectsResponse200 = OrganisationProjectEntity[]

export type GetOrganisationTransactionNumbersRequest = OrganisationEntityRequest

export type GetOrganisationTransactionNumbersResponse200 = OrganisationTransactionNumberEntity[]

export type GetOrganisationTransactionTypesRequest = OrganisationEntityRequest

export type GetOrganisationTransactionTypesResponse200 = OrganisationTransactionTypeEntity[]

export type GetOrganisationVatCodesRequest = OrganisationEntityRequest

export type GetOrganisationVatCodesResponse200 = OrganisationVatCodeEntity[]
