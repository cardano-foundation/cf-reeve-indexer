export enum AssetCategory {
  CASH = 'CASH',
  CRYPTO_ASSETS = 'CRYPTO_ASSETS',
  OTHER = 'OTHER',
  PREPAYMENTS = 'PREPAYMENTS',
  FINANCIAL_ASSETS = 'FINANCIAL_ASSETS',
  INVESTMENTS = 'INVESTMENTS',
  PROPERTY_PLANT_EQUIPMENT = 'PROPERTY_PLANT_EQUIPMENT',
  INTANGIBLE_ASSETS = 'INTANGIBLE_ASSETS'
}

export enum LiabilityCategory {
  RESULTS_CARRIED_FORWARD = 'RESULTS_CARRIED_FORWARD',
  PROFIT_OF_THE_YEAR = 'PROFIT_OF_THE_YEAR',
  OTHER = 'OTHER',
  PROVISIONS = 'PROVISIONS',
  TRADE_ACCOUNTS_PAYABLE = 'TRADE_ACCOUNTS_PAYABLE',
  ACCRUSAL_AND_SHORT_TERM_PROVISIONS = 'ACCRUSAL_AND_SHORT_TERM_PROVISIONS',
  CAPITAL = 'CAPITAL'
}

export enum IncomeStream {
  FINANCIAL_INCOME = 'FINANCIAL_INCOME',
  STAKING_REWARDS = 'STAKING_REWARDS',
  BUILDING_OF_PROVISIONS = 'BUILDING_OF_PROVISIONS',
  GAINS_ON_SALES_OF_CRYPTO_CURRENCIES = 'GAINS_ON_SALES_OF_CRYPTO_CURRENCIES',
  OTHER = 'OTHER'
}

export enum Expense {
  COST_OF_SERVICE = 'COST_OF_SERVICE',
  PERSONNEL_EXPENSES = 'PERSONNEL_EXPENSES',
  FINANCIAL_EXPENSES = 'FINANCIAL_EXPENSES',
  TAX_EXPENSES = 'TAX_EXPENSES',
  OTHER_OPERATING_EXPENSES = 'OTHER_OPERATING_EXPENSES'
}

export enum BalanceSheet {
  ASSETS = 'ASSETS',
  LIABILITIES = 'LIABILITIES'
}

export type Assets = Record<AssetCategory, number>

export type Liabilities = Record<LiabilityCategory, number>

export type Expenses = Record<Expense, number>

export type IncomeStreams = Record<IncomeStream, number>

export type ProfitOfTheYear = Record<string, number>

export type BalanceSheetAssets = Record<BalanceSheet.ASSETS, Assets>

export type BalanceSheetLiabilities = Record<BalanceSheet.LIABILITIES, Liabilities>

export type BalanceSheetOverview = BalanceSheetAssets & BalanceSheetLiabilities

export enum Metric {
  BALANCE_SHEET = 'BALANCE_SHEET',
  INCOME_STATEMENT = 'INCOME_STATEMENT'
}

export enum BalanceSheetSubmetric {
  ASSET_CATEGORIES = 'ASSET_CATEGORIES',
  BALANCE_SHEET_OVERVIEW = 'BALANCE_SHEET_OVERVIEW',
  TOTAL_ASSETS = 'TOTAL_ASSETS',
  TOTAL_LIABILITIES = 'TOTAL_LIABILITIES'
}

export enum IncomeStatementSubmetric {
  INCOME_STREAMS = 'INCOME_STREAMS',
  PROFIT_OF_THE_YEAR = 'PROFIT_OF_THE_YEAR',
  TOTAL_EXPENSES = 'TOTAL_EXPENSES'
}

export type BalanceSheetMetrics = Record<Metric.BALANCE_SHEET, BalanceSheetSubmetric[]>

export type IncomeStatementMetrics = Record<Metric.INCOME_STATEMENT, IncomeStatementSubmetric[]>

export type Metrics = BalanceSheetMetrics & IncomeStatementMetrics

export interface GetAvailableMetricsResponse200 {
  metrics: Metrics
}

export interface GetMetricsRequest {
  organisationId: string
  metricView: {
    metrics: Metrics
  }
  startDate?: string
  endDate?: string
}

export type BalanceSheetMetricsResponse = Record<Metric.BALANCE_SHEET, (AssetCategory | BalanceSheetOverview)[]>

export type IncomeStatementMetricsResponse = Record<Metric.INCOME_STATEMENT, (IncomeStream | Expense)[]>

export type MetricsData = BalanceSheetMetricsResponse & IncomeStatementMetricsResponse

export interface GetMetricsResponse200 {
  data: MetricsData
}
