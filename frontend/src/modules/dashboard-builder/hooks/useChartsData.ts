import {
  Assets,
  BalanceSheetOverview,
  BalanceSheetSubmetric,
  Expenses,
  GetAvailableMetricsResponse200,
  GetMetricsResponse200,
  IncomeStatementSubmetric,
  IncomeStreams,
  ProfitOfTheYear
} from 'libs/api-connectors/backend-connector-lob/api/metrics/metricsApi.types.ts'

export interface ChartsData {
  [BalanceSheetSubmetric.ASSET_CATEGORIES]: Assets
  [BalanceSheetSubmetric.BALANCE_SHEET_OVERVIEW]: BalanceSheetOverview
  [BalanceSheetSubmetric.TOTAL_ASSETS]: number
  [BalanceSheetSubmetric.TOTAL_LIABILITIES]: number
  [IncomeStatementSubmetric.INCOME_STREAMS]: IncomeStreams
  [IncomeStatementSubmetric.PROFIT_OF_THE_YEAR]: ProfitOfTheYear
  [IncomeStatementSubmetric.TOTAL_EXPENSES]: Expenses
}

export const useChartsData = (availableMetrics: GetAvailableMetricsResponse200 | null, metrics: GetMetricsResponse200 | null) => {
  const available = Object.entries(availableMetrics?.metrics ?? {})

  const data = available.reduce<ChartsData>((acc, [metric, submetrics]) => {
    const submetricData = submetrics.reduce<ChartsData>(
      (acc, submetric, index) => ({ ...acc, [submetric]: metrics?.data?.[metric as keyof typeof metrics.data]?.[index] ?? undefined }),
      {} as ChartsData
    )

    return { ...acc, ...submetricData }
  }, {} as ChartsData)

  return data
}
