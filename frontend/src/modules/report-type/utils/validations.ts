import { BalanceSheetDetailsKeys, IncomeStatementDetailsKeys, ReportApiResponse, ReportType } from 'libs/api-connectors/backend-connector-lob/api/reports/reportsApi.types.ts'
import { ReportBalanceSheetFormValues, ReportIncomeStatementFormValues } from 'modules/report-type/components/ReportTypeForm/ReportTypeForm.types.ts'
import { getTotalIncome } from 'modules/report-type/utils/calculations.ts'

export const validateCrossReportProfit = (report: ReportApiResponse | undefined, values: ReportBalanceSheetFormValues | ReportIncomeStatementFormValues) => {
  if (!report) return

  if (report.type === ReportType.INCOME_STATEMENT) {
    if ('profitForTheYear' in values) {
      const profitForTheYear = parseFloat(values.profitForTheYear.replace(/,/g, ''))
      const profitOfTheYear = parseFloat(report?.profitForTheYear)

      if (profitOfTheYear !== profitForTheYear) {
        return true
      }

      return false
    }

    return false
  }

  if (report.type === ReportType.BALANCE_SHEET) {
    const totalIncome = getTotalIncome(values)
    const profitOfTheYear = parseFloat(report?.profitForTheYear ?? '0')

    if (profitOfTheYear !== totalIncome) {
      return true
    }

    return false
  }

  return false
}

export const validateAgainstGenereatedReport = (
  generatedReport: ReportApiResponse,
  values: ReportBalanceSheetFormValues | ReportIncomeStatementFormValues,
  onWarnings: (key: BalanceSheetDetailsKeys | IncomeStatementDetailsKeys, isValid: boolean | undefined) => void
) => {
  const entries = Object.entries(values) as [BalanceSheetDetailsKeys | IncomeStatementDetailsKeys, string][]

  entries.forEach(([key, value]) => {
    const generatedValue = parseFloat((generatedReport as unknown as Record<BalanceSheetDetailsKeys | IncomeStatementDetailsKeys, string>)[key] ?? '0')
    const currentValue = parseFloat(value.replace(/,/g, ''))

    const isValid = generatedValue === currentValue

    onWarnings(key, generatedValue !== undefined ? isValid : undefined)
  })
}
