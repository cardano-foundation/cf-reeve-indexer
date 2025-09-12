import { ReportType } from 'libs/api-connectors/backend-connector-lob/api/reports/reportsApi.types.ts'
import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation'
import { useGenerateReportModel } from 'libs/models/reports-model/GenerateReportModel/GenerateReportModel.service'
import { useSearchBalanceSheetReportModel, useSearchIncomeStatementReportModel } from 'libs/models/reports-model/SearchReportModel/SearchReport.service.ts'
import { getSearchReportPayload } from 'modules/report-parameters/utils/payload.ts'

interface ReportsState {
  period?: string
  reportType?: ReportType
  isAutomaticGeneration?: boolean
}

export const useReportTypeQueries = (state: ReportsState) => {
  const { period, reportType = ReportType.BALANCE_SHEET } = state
  const selectedOrganisation = useSelectedOrganisation()

  const payload = getSearchReportPayload(period ?? '')

  const { generatedReport, isGenerateReportFetching } = useGenerateReportModel({ organisationId: selectedOrganisation, reportType, ...payload })
  const { searchedBalanceSheetReport, isSearchBalanceSheetReportFetching } = useSearchBalanceSheetReportModel({ organisationId: selectedOrganisation, reportType, ...payload })
  const { searchedIncomeStatementReport, isSearchedIncomeStatementReportFetching } = useSearchIncomeStatementReportModel({
    organisationId: selectedOrganisation,
    reportType,
    ...payload
  })

  const [generatedReportOfCurrentType] = generatedReport?.report ?? []
  const [balanceSheetReport] = searchedBalanceSheetReport?.report ?? []
  const [incomeStatementReport] = searchedIncomeStatementReport?.report ?? []

  const reportOfCurrentType = reportType ? (reportType === ReportType.BALANCE_SHEET ? balanceSheetReport : incomeStatementReport) : undefined

  const reportOfOppositeType = reportType === ReportType.BALANCE_SHEET ? incomeStatementReport : balanceSheetReport

  const isFetching = isGenerateReportFetching || isSearchBalanceSheetReportFetching || isSearchedIncomeStatementReportFetching

  return {
    generatedReportOfCurrentType,
    reportOfCurrentType,
    reportOfOppositeType,
    isFetching
  }
}
