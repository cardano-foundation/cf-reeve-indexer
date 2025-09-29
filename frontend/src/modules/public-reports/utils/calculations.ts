import { FormikValues } from 'formik'

import { sumTotals } from './format'

export const getTotalCurrentAssets = (values: FormikValues) =>
  sumTotals([values.cashAndCashEquivalents, values.cryptoAssets, values.otherReceivables, values.prepaymentsAndOtherShortTermAssets])

export const getTotalNonCurrentAssets = (values: FormikValues) => sumTotals([values.financialAssets, values.investments, values.tangibleAssets, values.intangibleAssets])

export const getTotalAssets = (values: FormikValues) =>
  sumTotals([
    values.cashAndCashEquivalents,
    values.cryptoAssets,
    values.otherReceivables,
    values.prepaymentsAndOtherShortTermAssets,
    values.financialAssets,
    values.investments,
    values.tangibleAssets,
    values.intangibleAssets
  ])

export const getTotalShortTermLiabilities = (values: FormikValues) =>
  sumTotals([values.tradeAccountsPayables, values.otherShortTermLiabilities, values.accrualsAndShortTermProvisions])

export const getTotalLongTermLiabilities = (values: FormikValues) => sumTotals([values.provisions])

export const getTotalLiabilities = (values: FormikValues) =>
  sumTotals([
    values.tradeAccountsPayables,
    values.otherShortTermLiabilities,
    values.accrualsAndShortTermProvisions,
    values.provisions,
    values.capital,
    values.resultsCarriedForward,
    values.profitForTheYear
  ])

export const getTotalFoundationCapital = (values: FormikValues) => sumTotals([values.capital, values.resultsCarriedForward, values.profitForTheYear])

export const getGrossProfit = (values: FormikValues) => sumTotals([values.otherIncome, values.buildOfLongTermProvision, values.externalServices])

export const getOperatingProfit = (values: FormikValues) =>
  getGrossProfit(values) +
  sumTotals([
    values.personnelExpenses,
    values.rentExpenses,
    values.generalAndAdministrativeExpenses,
    values.depreciationAndImpairmentLossesOnTangibleAssets,
    values.amortizationOnIntangibleAssets
  ])

export const getProfitBeforeTax = (values: FormikValues) =>
  getOperatingProfit(values) +
  sumTotals([
    values.financialRevenues,
    values.realisedGainsOnSaleOfCryptocurrencies,
    values.stakingRewardsIncome,
    values.netIncomeOptionsSale,
    values.financialExpenses,
    values.extraordinaryExpenses
  ])

export const getProfitForTheYear = (values: FormikValues) => getProfitBeforeTax(values) + sumTotals([values.directTaxes])

export const getTotalIncome = (values: FormikValues) =>
  sumTotals([
    values.otherIncome,
    values.buildOfLongTermProvision,
    values.externalServices,
    values.personnelExpenses,
    values.rentExpenses,
    values.generalAndAdministrativeExpenses,
    values.depreciationAndImpairmentLossesOnTangibleAssets,
    values.amortizationOnIntangibleAssets,
    values.financialRevenues,
    values.realisedGainsOnSaleOfCryptocurrencies,
    values.stakingRewardsIncome,
    values.netIncomeOptionsSale,
    values.financialExpenses,
    values.extraordinaryExpenses,
    values.directTaxes
  ])
