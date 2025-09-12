import { BalanceSheetDetailsKeys, IncomeStatementDetailsKeys } from 'libs/api-connectors/backend-connector-lob/api/reports/reportsApi.types.ts'

export type ReportBalanceSheetFormValues = Record<BalanceSheetDetailsKeys, string>

export type ReportIncomeStatementFormValues = Record<IncomeStatementDetailsKeys, string>
