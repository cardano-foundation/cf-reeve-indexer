import { BalanceSheetOverview, Expenses } from 'libs/api-connectors/backend-connector-lob/api/metrics/metricsApi.types.ts'
import { intl } from 'libs/translations/utils/intl.ts'
import { formatNumberCurrency } from 'libs/utils/format.ts'

export const getPieData = <T extends string>(data: Record<T, number>) =>
  (Object.entries(data) as [T, number][]).map(([key, value]) => ({ id: key, label: intl.formatMessage({ id: key }), value }))

export const getStatisticData = (data: number) => formatNumberCurrency(data, { minimumFractionDigits: 0, maximumFractionDigits: 2, notation: 'compact' })

export const getTotalExpensesData = (data: Expenses) => {
  return Object.entries(data).map(([key, value]) => ({ expense: Math.abs(value), label: intl.formatMessage({ id: key }) }))
}

export const getBalanceSheetOverviewData = (data: BalanceSheetOverview) => {
  const { CASH, CRYPTO_ASSETS, FINANCIAL_ASSETS, INTANGIBLE_ASSETS, INVESTMENTS, OTHER: OTHER_ASSETS, PREPAYMENTS, PROPERTY_PLANT_EQUIPMENT } = data.ASSETS ?? {}
  const {
    ACCRUSAL_AND_SHORT_TERM_PROVISIONS,
    CAPITAL,
    OTHER: OTHER_LIABILITIES,
    PROFIT_OF_THE_YEAR,
    PROVISIONS,
    RESULTS_CARRIED_FORWARD,
    TRADE_ACCOUNTS_PAYABLE
  } = data.LIABILITIES ?? {}

  const currentAssets = [CASH, CRYPTO_ASSETS, OTHER_ASSETS, PREPAYMENTS].filter((value) => Boolean(value)).reduce((acc, value) => acc + value, 0)
  const nonCurrentAssets = [FINANCIAL_ASSETS, INVESTMENTS, PROPERTY_PLANT_EQUIPMENT, INTANGIBLE_ASSETS].filter((value) => Boolean(value)).reduce((acc, value) => acc + value, 0)

  const currentLiabilities = [TRADE_ACCOUNTS_PAYABLE, OTHER_LIABILITIES, ACCRUSAL_AND_SHORT_TERM_PROVISIONS]
    .filter((value) => Boolean(value))
    .reduce((acc, value) => acc + value, 0)
  const nonCurrentLiabilities = PROVISIONS ?? 0
  const capital = [CAPITAL, RESULTS_CARRIED_FORWARD, PROFIT_OF_THE_YEAR].filter((value) => Boolean(value)).reduce((acc, value) => acc + value, 0)

  return [
    {
      currentAssets,
      nonCurrentAssets,
      currentLiabilities: null,
      nonCurrentLiabilities: null,
      capital: null
    },
    {
      currentAssets: null,
      nonCurrentAssets: null,
      currentLiabilities,
      nonCurrentLiabilities,
      capital
    }
  ]
}
