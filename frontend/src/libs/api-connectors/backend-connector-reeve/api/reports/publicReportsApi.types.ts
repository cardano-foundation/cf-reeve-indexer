export type CurrencyType = Record<string, string>

export enum IntervalType {
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  YEAR = 'YEAR'
}

export enum ReportType {
  BALANCE_SHEET = 'BALANCE_SHEET',
  INCOME_STATEMENT = 'INCOME_STATEMENT'
}

export enum ReportQuarter {
  Q1 = 'Q1',
  Q2 = 'Q2',
  Q3 = 'Q3',
  Q4 = 'Q4'
}

export enum ReportMonth {
  JAN = 'JAN',
  FEB = 'FEB',
  MAR = 'MAR',
  APR = 'APR',
  MAY = 'MAY',
  JUN = 'JUN',
  JUL = 'JUL',
  AUG = 'AUG',
  SEP = 'SEP',
  OCT = 'OCT',
  NOV = 'NOV',
  DEC = 'DEC'
}

export type NestedMap = { [key: string]: string | NestedMap }

export type ReportEntity = {
  organisationId: string
  subType: ReportType
  intervalType: IntervalType
  currency: string
  year: number
  period: number
  ver: number
  blockChainHash: string
  identities: IdentityAttestationView[]
  data: NestedMap
}

/**
 * Generic verified-identity attestation for a credential presented alongside a report or
 * document (design spec §D). Schema-aware successor to the old LEI-hardcoded `LEIResponse`:
 * GLEIF cross-checking only applies when `lei` is present (the vLEI schema); other schemas
 * carry their attributes in `claims`. Shared with the documents API - see documentsApi.types.ts.
 */
export interface IdentityAttestationView {
  identityVerified: boolean
  aid: string
  schemaSaid: string
  schemaName: string
  claims: Record<string, unknown> | null
  lei: string | null
  txHash?: string
  credentialTxHash?: string
}

export interface GetPublicReportsRequestParameters {
  page?: number
  size?: number
  sort?: string[]
}

export interface GetPublicReportsRequestBody {
  organisationId: string
  reportType?: ReportType[] | string[]
  intervalType?: IntervalType[]
  blockChainHash?: string
  year?: number[]
  period?: number[]
}

export interface GetPublicReportsRequest {
  parameters: GetPublicReportsRequestParameters
  body: GetPublicReportsRequestBody
}

export interface GetPublicReportsResponse200 {
  success: boolean
  reports: ReportEntity[]
  total: number
  error: null
}
