import { BalanceSheetDetailsApiResponse, IncomeStatementDetailsApiResponse } from 'libs/api-connectors/backend-connector-lob/api/reports/reportsApi.types.ts'
import { formatNumber } from 'libs/utils/format.ts'

export const getBalanceSheetInitialValues = (report: BalanceSheetDetailsApiResponse | null) => ({
  cashAndCashEquivalents: report?.cashAndCashEquivalents ?? formatNumber(0),
  cryptoAssets: report?.cryptoAssets ?? formatNumber(0),
  otherReceivables: report?.otherReceivables ?? formatNumber(0),
  prepaymentsAndOtherShortTermAssets: report?.prepaymentsAndOtherShortTermAssets ?? formatNumber(0),
  financialAssets: report?.financialAssets ?? formatNumber(0),
  investments: report?.investments ?? formatNumber(0),
  tangibleAssets: report?.tangibleAssets ?? formatNumber(0),
  intangibleAssets: report?.intangibleAssets ?? formatNumber(0),
  tradeAccountsPayables: report?.tradeAccountsPayables ?? formatNumber(0),
  otherShortTermLiabilities: report?.otherShortTermLiabilities ?? formatNumber(0),
  accrualsAndShortTermProvisions: report?.accrualsAndShortTermProvisions ?? formatNumber(0),
  provisions: report?.provisions ?? formatNumber(0),
  capital: report?.capital ?? formatNumber(0),
  resultsCarriedForward: report?.resultsCarriedForward ?? formatNumber(0),
  profitForTheYear: report?.profitForTheYear ?? formatNumber(0)
})

export const getIncomeStatementInitialValues = (report: IncomeStatementDetailsApiResponse | null) => ({
  otherIncome: report?.otherIncome ?? formatNumber(0),
  buildOfLongTermProvision: report?.buildOfLongTermProvision ?? formatNumber(0),
  externalServices: report?.externalServices ?? formatNumber(0),
  personnelExpenses: report?.personnelExpenses ?? formatNumber(0),
  rentExpenses: report?.rentExpenses ?? formatNumber(0),
  generalAndAdministrativeExpenses: report?.generalAndAdministrativeExpenses ?? formatNumber(0),
  depreciationAndImpairmentLossesOnTangibleAssets: report?.depreciationAndImpairmentLossesOnTangibleAssets ?? formatNumber(0),
  amortizationOnIntangibleAssets: report?.amortizationOnIntangibleAssets ?? formatNumber(0),
  financialRevenues: report?.financialRevenues ?? formatNumber(0),
  realisedGainsOnSaleOfCryptocurrencies: report?.realisedGainsOnSaleOfCryptocurrencies ?? formatNumber(0),
  stakingRewardsIncome: report?.stakingRewardsIncome ?? formatNumber(0),
  netIncomeOptionsSale: report?.netIncomeOptionsSale ?? formatNumber(0),
  financialExpenses: report?.financialExpenses ?? formatNumber(0),
  extraordinaryExpenses: report?.extraordinaryExpenses ?? formatNumber(0),
  directTaxes: report?.directTaxes ?? formatNumber(0)
})
