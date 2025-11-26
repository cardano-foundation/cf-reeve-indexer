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

export enum ReportStatus {
  PUBLISH = 'PUBLISH',
  PUBLISHED = 'PUBLISHED'
}

export enum ReportDetailsErrorTitle {
  INVALID_REPORT_DATA = 'INVALID_REPORT_DATA',
  PROFIT_FOR_THE_YEAR_MISMATCH = 'PROFIT_FOR_THE_YEAR_MISMATCH'
}

export interface ReportDetailsResponse400Error {
  detail: string
  reportId: string
  status: number
  title: ReportDetailsErrorTitle
}

export type NestedMap = { [key: string]: string | NestedMap };

export type ReportApiResponse = {
  organisationId: string
  type: ReportType
  intervalType: IntervalType
  currency: string
  year: number
  period: number
  ver: number
  blockChainHash: string
  identityVerified: boolean
  lei: string
  data: NestedMap
}

export interface GetPublicReportsRequest {
  organisationId: string
  reportType?: ReportType | string
  intervalType?: IntervalType
  year?: number
  period?: number
}

export interface GetReportsResponse200 {
  success: boolean
  reports: ReportApiResponse[]
  error: null
}