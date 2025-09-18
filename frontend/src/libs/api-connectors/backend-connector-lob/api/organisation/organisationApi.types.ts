export interface OrganisationApiResponse {
  id: string
  taxIdNumber: string
  address: string
  postCode: string
  province: string
  city: string
  countryCode: string
  name: string
  websiteUrl: string
  description: string
  phoneNumber: string
  currencyId: string
  organisationCurrencies: string[]
  reportCurrencyId: string
  accountPeriodFrom: string
  accountPeriodTo: string
  adminEmail: string
  logo: string
}

export interface OrganisationsApiResponse extends Array<OrganisationApiResponse> {}

export interface Currency {
  customerCode: string
  currencyId: string
}

export type CurrenciesApiResponse = Currency[]
