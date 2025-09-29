import { BalanceSheetDetailsKeys, IncomeStatementDetailsKeys } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types'

export type ReportBalanceSheetFormValues = Record<BalanceSheetDetailsKeys, string>

export type ReportIncomeStatementFormValues = Record<IncomeStatementDetailsKeys, string>
