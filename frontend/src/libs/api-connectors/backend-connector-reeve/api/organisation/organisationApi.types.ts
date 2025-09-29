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

export interface UpdateOrganisationDTO
  extends Pick<
    OrganisationApiResponse,
    'id' | 'name' | 'adminEmail' | 'phoneNumber' | 'websiteUrl' | 'city' | 'postCode' | 'province' | 'currencyId' | 'reportCurrencyId' | 'address'
  > {}

export interface OrganisationsApiResponse extends Array<OrganisationApiResponse> {}

interface OrganisationEntity {
  customerCode: string
  externalCustomerCode: string
  name: string
}

export enum AccountType {
  ASSET = 'ASSET',
  EXPENSES = 'EXPENSES',
  FOUNDATION_CAPITAL = 'FOUNDATION_CAPITAL',
  LIABILITY = 'LIABILITY',
  REVENUES = 'REVENUES'
}

export enum AssetAccountSubtype {
  CASH_AND_CASH_EQUIVALENTS = 'CASH_AND_CASH_EQUIVALENTS',
  CRYPTO_ASSETS = 'CRYPTO_ASSETS',
  FINANCIAL_ASSETS = 'FINANCIAL_ASSETS',
  INTANGIBLE_ASSETS = 'INTANGIBLE_ASSETS',
  MOVABLE_TANGIBLE_ASSETS = 'MOVABLE_TANGIBLE_ASSETS',
  OTHER_SHORT_TERM_RECEIVABLES = 'OTHER_SHORT_TERM_RECEIVABLES',
  PREPAID_EXPENSES_AND_ACCRUED_INCOME = 'PREPAID_EXPENSES_AND_ACCRUED_INCOME'
}

export enum ExpensesAccountSubtype {
  ADVERTISING_EXPENSES = 'ADVERTISING_EXPENSES',
  AMORTIZATION_ON_INTANGIBLE_ASSETS = 'AMORTIZATION_ON_INTANGIBLE_ASSETS',
  DEPRECIATION_AND_IMPAIRMENT_LOSSES_ON_MOVABLE_TANGIBLE_ASSETS = 'DEPRECIATION_AND_IMPAIRMENT_LOSSES_ON_MOVABLE_TANGIBLE_ASSETS',
  DIRECT_TAXES = 'DIRECT_TAXES',
  EXTERNAL_SERVICES = 'EXTERNAL_SERVICES',
  EXTRAORDINARY_NON_RECURRING_OR_PRIOR_PERIOD_EXPENSES = 'EXTRAORDINARY_NON_RECURRING_OR_PRIOR_PERIOD_EXPENSES',
  FINANCIAL_EXPENSES = 'FINANCIAL_EXPENSES',
  FINANCIAL_INCOME = 'FINANCIAL_INCOME',
  NET_INCOME_OPTION_SALES = 'NET_INCOME_OPTION_SALES',
  OFFICE_AND_ADMINISTRATIVE_EXPENSES = 'OFFICE_AND_ADMINISTRATIVE_EXPENSES',
  PERSONNEL_EXPENSES = 'PERSONNEL_EXPENSES',
  REALISED_GAINS_ON_SALE_OF_CRYPTO_CURRENCIES = 'REALISED_GAINS_ON_SALE_OF_CRYPTO_CURRENCIES',
  RENT_EXPENSES = 'RENT_EXPENSES',
  STAKING_REWARDS_INCOME = 'STAKING_REWARDS_INCOME'
}

export enum FoundationCapitalAccountSubtype {
  FOUNDATION_CAPITAL = 'FOUNDATION_CAPITAL',
  PROFIT_FOR_THE_YEAR = 'PROFIT_FOR_THE_YEAR',
  RESULTS_CARRIED_FORWARD = 'RESULTS_CARRIED_FORWARD'
}

export enum LiabilityAccountSubtype {
  ACCRUED_EXPENSES_DEFERRED_INCOME_AND_SHORT_TERM_PROVISIONS = 'ACCRUED_EXPENSES_DEFERRED_INCOME_AND_SHORT_TERM_PROVISIONS',
  OTHER_SHORT_TERM_LIABILITIES = 'OTHER_SHORT_TERM_LIABILITIES',
  PROVISIONS = 'PROVISIONS',
  TRADE_ACCOUNTS_PAYABLE = 'TRADE_ACCOUNTS_PAYABLE'
}

export enum RevenuesAccountSubtype {
  BUILD_OF_LONG_TERM_PROVISIONS = 'BUILD_OF_LONG_TERM_PROVISIONS'
}

export interface OrganisationChartCodesResponse {
  customerCode: string
  refCode: string
  eventRefCode: string
  name: string
}

export interface OrganisationChartSubtypeResponse {
  id: number
  name: AssetAccountSubtype | ExpensesAccountSubtype | FoundationCapitalAccountSubtype | LiabilityAccountSubtype | RevenuesAccountSubtype
  organisationId: string
  chartOfAccounts?: OrganisationChartCodesResponse[]
}

export interface OrganisationChartTypesResponse {
  id: number
  name: AccountType
  organisationId: string
  subType: OrganisationChartSubtypeResponse[]
}

export type OrganisationChartTypesApiResponse200 = OrganisationChartTypesResponse[]

export type OrganisationCostCentersApiResponse200 = OrganisationEntity[]

export type OrganisationProjectsApiResponse200 = OrganisationEntity[]

export interface Currency {
  customerCode: string
  currencyId: string
}

export type CurrenciesApiResponse = Currency[]
