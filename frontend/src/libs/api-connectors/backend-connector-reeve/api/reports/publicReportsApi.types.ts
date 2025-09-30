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

export enum PublishError {
  INVALID_REPORT_DATA = 'INVALID_REPORT_DATA',
  PROFIT_FOR_THE_YEAR_MISMATCH = 'PROFIT_FOR_THE_YEAR_MISMATCH',
  REPORT_DATA_MISMATCH = 'REPORT_DATA_MISMATCH'
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

export interface ReportBalanceSheetBasicDetails {
  organisationId: string
  reportId: string
  type: ReportType.BALANCE_SHEET
  intervalType: IntervalType
  documentCurrencyCustomerCode: string
  year: number
  period: number
  ver: number
  publish: boolean
  canBePublish: boolean
  canPublishError?: PublishError | null
  blockChainHash: string
  date: string
  createdAt: string
  createdBy: string
  publishedBy: string | null
  publishDate: string | null
  updatedAt: string | null
  updatedBy: string | null
  error: ReportDetailsResponse400Error | null
}

export interface ReportIncomeStatementBasicDetails {
  organisationId: string
  reportId: string
  type: ReportType.INCOME_STATEMENT
  documentCurrencyCustomerCode: string
  intervalType: IntervalType
  year: number
  period: number
  ver: number
  publish: boolean
  canBePublish: boolean
  canPublishError?: PublishError | null
  blockChainHash: string
  date: string
  createdAt: string
  createdBy: string
  publishedBy: string | null
  publishDate: string | null
  updatedAt: string | null
  updatedBy: string | null
  error: ReportDetailsResponse400Error | null
}

export type ReportBasicDetails = ReportBalanceSheetBasicDetails | ReportIncomeStatementBasicDetails

export interface AssetsDetails {
  cashAndCashEquivalents: number
  cryptoAssets: number
  otherReceivables: number
  prepaymentsAndOtherShortTermAssets: number
  financialAssets: number
  investments: number
  tangibleAssets: number
  intangibleAssets: number
}

export interface LiabilitiesDetails {
  tradeAccountsPayables: number
  otherShortTermLiabilities: number
  accrualsAndShortTermProvisions: number
  provisions: number
}

export interface FoundationCapitalDetails {
  capital: number
  resultsCarriedForward: number
  profitForTheYear: number
}

export interface IncomeDetails {
  otherIncome: number
  buildOfLongTermProvision: number
  externalServices: number
  personnelExpenses: number
  rentExpenses: number
  generalAndAdministrativeExpenses: number
  depreciationAndImpairmentLossesOnTangibleAssets: number
  amortizationOnIntangibleAssets: number
  financialRevenues: number
  realisedGainsOnSaleOfCryptocurrencies: number
  stakingRewardsIncome: number
  netIncomeOptionsSale: number
  financialExpenses: number
  extraordinaryExpenses: number
  directTaxes: number
}

export type BalanceSheetDetailsKeys = keyof AssetsDetails | keyof LiabilitiesDetails | keyof FoundationCapitalDetails

export type IncomeStatementDetailsKeys = keyof IncomeDetails

export type BalanceSheetDetailsApiResponse = Partial<Record<BalanceSheetDetailsKeys, string>>

export type IncomeStatementDetailsApiResponse = Partial<Record<IncomeStatementDetailsKeys, string>>

export type ReportBalanceSheetApiResponse = ReportBalanceSheetBasicDetails & BalanceSheetDetailsApiResponse

export type ReportIncomeStatementApiResponse = ReportIncomeStatementBasicDetails & IncomeStatementDetailsApiResponse

export type ReportApiResponse = ReportBalanceSheetApiResponse | ReportIncomeStatementApiResponse

export interface GetReportParametersRequest {
  organisationId: string
}

export interface GetReportParametersResponse200 {
  currencyType: CurrencyType
  periodFrom: string
  reportType: ReportType[]
}

export interface GetReportsRequest {
  organisationId: string
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
  report: ReportApiResponse[]
  error: null
}

export interface PublishReportRequest {
  organisationId: string
  reportId: string
}

export interface PublishReportResponse200 {
  success: boolean
  report: ReportApiResponse[]
  error: null
}

export enum PublishReportErrorTitle {
  NO_RELATED_REPORT = 'NO_RELATED_REPORT'
}

interface PublishReportResponse400Error {
  detail: string
  reportId: string
  status: number
  title: PublishReportErrorTitle
}

export interface PublishReportResponse400 {
  success: boolean
  report: []
  error: PublishReportResponse400Error
}

export interface CreateReportRequest {
  organisationId: string
  reportType: ReportType
  intervalType: IntervalType
  year: number
  period: number
}

export interface CreateReportResponse200 {
  success: boolean
  report: ReportApiResponse[]
  error: null
}

export enum CreateReportErrorTitle {
  NO_RELATED_REPORT = 'NO_RELATED_REPORT'
}

interface CreateReportResponse400Error {
  detail: string
  reportId: string
  status: number
  title: CreateReportErrorTitle
}

export interface CreateReportResponse400 {
  success: boolean
  report: []
  error: CreateReportResponse400Error
}

export interface SearchReportRequest {
  organisationId: string
  reportType: ReportType
  intervalType: IntervalType
  year: number
  period: number
}

export interface SearchReportResponse200 {
  success: boolean
  report: ReportApiResponse[]
  error: null
}

export enum SearchReportErrorTitle {
  REPORT_NOT_FOUND = 'REPORT_NOT_FOUND'
}

interface SearchReportResponse404Error {
  detail: string
  reportId: string
  status: number
  title: SearchReportErrorTitle
}

export interface SearchReportResponse404 {
  success: boolean
  report: []
  error: SearchReportResponse404Error
}

export interface GenerateReportRequest {
  organisationId: string
  reportType: ReportType
  intervalType: IntervalType
  year: number
  period: number
  preview?: boolean
}

export interface GenerateReportResponse200 {
  success: boolean
  report: ReportApiResponse[]
  error: null
  total: number
}
