import { useState } from 'react'

import { BalanceSheetDetailsKeys, IncomeStatementDetailsKeys, ReportType } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types'

export type BalanceSheetWarnings = Record<BalanceSheetDetailsKeys, boolean | undefined>

const DEAULT_BALANCE_SHEET_WARNINGS: BalanceSheetWarnings = {
  cashAndCashEquivalents: undefined,
  cryptoAssets: undefined,
  otherReceivables: undefined,
  prepaymentsAndOtherShortTermAssets: undefined,
  financialAssets: undefined,
  investments: undefined,
  tangibleAssets: undefined,
  intangibleAssets: undefined,
  tradeAccountsPayables: undefined,
  otherShortTermLiabilities: undefined,
  accrualsAndShortTermProvisions: undefined,
  provisions: undefined,
  capital: undefined,
  resultsCarriedForward: undefined,
  profitForTheYear: undefined
}

export type IncomeStatementWarnings = Record<IncomeStatementDetailsKeys, boolean | undefined>

const DEFAULT_INCOME_STATEMENT_WARNINGS: IncomeStatementWarnings = {
  otherIncome: undefined,
  buildOfLongTermProvision: undefined,
  externalServices: undefined,
  personnelExpenses: undefined,
  rentExpenses: undefined,
  generalAndAdministrativeExpenses: undefined,
  depreciationAndImpairmentLossesOnTangibleAssets: undefined,
  amortizationOnIntangibleAssets: undefined,
  financialRevenues: undefined,
  realisedGainsOnSaleOfCryptocurrencies: undefined,
  stakingRewardsIncome: undefined,
  netIncomeOptionsSale: undefined,
  financialExpenses: undefined,
  extraordinaryExpenses: undefined,
  directTaxes: undefined
}

interface ReportValidateState {
  reportType?: ReportType
}

export const useReportValidate = (state: ReportValidateState) => {
  const { reportType } = state

  const initialWarnings = reportType === ReportType.BALANCE_SHEET ? DEAULT_BALANCE_SHEET_WARNINGS : DEFAULT_INCOME_STATEMENT_WARNINGS

  const [warnings, setWarnings] = useState(initialWarnings)

  const hasAnyWarnings = Object.values(warnings).some((value) => value === false)

  const handleResetWarnings = () => {
    setWarnings(initialWarnings)
  }

  const handleWarnings = (key: BalanceSheetDetailsKeys | IncomeStatementDetailsKeys, isValid: boolean | undefined) => {
    setWarnings((prev) => ({
      ...prev,
      [key]: isValid
    }))
  }

  return { warnings, handleResetWarnings, handleWarnings, hasAnyWarnings }
}
