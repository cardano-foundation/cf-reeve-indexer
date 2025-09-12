// INFO: this is the initial draft. did not get a chance to discuss it today, and leave it for further discussions and modifications. if needed before Monday you can merge and modify.
// TODO: discuss and finalise

// INFO: for the organisation details we will likely use and extend further the organisation type from organisationApi.ts and organisation endpoint and keep it there. though until confirmed, I propose draft below to keep things together and do not modify existing code before it is confirmed.
// TODO: after consultation with Marco: use the same endpoint (move the type to where it belongs)
export interface OrganisationApiResponse {
  id: string // confirm if this is "cardano ID number"
  name?: string
  //   description: string
  // TODO: we need accounting currency and reporting currency
  currencyId: string
  //   accountPeriodFrom: string
  //   accountPeriodTo: string
  adminEmail: string
  //   logo: string
  // INFO: new fields added below (above uncommented those which are used in curren feature)
  address?: string
  city: string
  administrativeArea: string
  country: string
  postCode: string
  countryCode: string // TODO: confirm if this is phone number country code or abbreviation for the country
  phoneNumber: string
  website: string
}

export interface AccountApiResponse {
  number: string
  description: string
  currency: string
  counterparty: string
  type: string
  subtype: string
  referenceCode: string
  eventRefCodeDescription: string
  parentCode: string
  isActive: boolean
}
// TODO: discuss how to arrange nesting of the accounts - only store reference? or have a field with array holding nested accounts?
// TODO: talk with Marco to Cleo - needs to be sorted out on BE first and discussed in detail - talk later

export interface AccountsApiResponse {
  total: number
  accounts: AccountApiResponse[]
}

export interface CostCenterApiResponse {
  code: string
  description: string
  hierarchy: never // TODO: discuss
  reportingCostCenter: never // TODO: discuss
  isActive: boolean
}
// TODO: discuss how to arrange nesting of the cost centers - only store reference? or have a field with array holding nested accounts?
// TODO: talk with Marco to Cleo - needs to be sorted out on BE first and discussed in detail - talk later

export interface CostCentersApiResponse {
  total: number
  constCenters: CostCenterApiResponse[]
}

export interface ProjectCodeApiResponse {
  projectCode: string
  description: string
  hierarchy: string
  isActive: boolean
}
// TODO: discuss how to arrange nesting of the accounts - only store reference? or have a field with array holding nested accounts?
// TODO: talk with Marco to Cleo - needs to be sorted out on BE first and discussed in detail - talk later

export interface ProjectCodesApiResponse {
  total: number
  projectCodes: ProjectCodesApiResponse[]
}

export interface VatCodeApiResponse {
  projectCode: string
  description: string
  country: string
  rate: number
  isActive: boolean
}

export interface VatCodesApiResponse {
  total: number
  vatCodes: ProjectCodesApiResponse[]
}

export interface CurrencyCodeApiResponse {
  projectCode: string
  description: string
  isoCode: string
  isActive: boolean
}

export interface CurrencyCodesApiResponse {
  total: number
  currencyCodes: CurrencyCodeApiResponse[]
}

export interface EventCodeApiResponse {
  projectCode: string
  description: string
  debitRefCode: string
  creditRefCode: string
  isActive: boolean
}

export interface EventCodesApiResponse {
  total: number
  eventCodes: EventCodeApiResponse[]
}
// TODO: is event code and reference code one type with some difference in fields? or two different types coming from different source?
