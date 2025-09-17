import { BalanceSheetDetailsKeys, IncomeStatementDetailsKeys } from 'libs/api-connectors/backend-connector-lob/api/reports/publicReports.types.ts'

export type ReportBalanceSheetFormValues = Record<BalanceSheetDetailsKeys, string>

export type ReportIncomeStatementFormValues = Record<IncomeStatementDetailsKeys, string>
