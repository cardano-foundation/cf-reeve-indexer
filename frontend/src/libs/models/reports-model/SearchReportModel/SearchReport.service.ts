import { useQuery } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'
import { ReportType, SearchReportRequest } from 'libs/api-connectors/backend-connector-lob/api/reports/reportsApi.types.ts'

const getSearchReportQuery = async (parameters: SearchReportRequest) => {
  const { reportsApi } = backendLobApi()

  const data = await reportsApi.searchReport({ ...parameters })

  if (!data) return null

  return data
}

export const useSearchReportModel = (parameters: SearchReportRequest, isEnabled = false) => {
  const { data, refetch, isFetching } = useQuery({
    queryKey: ['SEARCH_REPORT', parameters],
    queryFn: () => getSearchReportQuery(parameters),
    retry: false,
    enabled: isEnabled
  })

  return {
    searchedReport: data ?? null,
    triggerSearchReport: refetch,
    isSearchReportFetching: isFetching
  }
}

export const useSearchBalanceSheetReportModel = (parameters: SearchReportRequest) => {
  const { data, refetch, isFetching } = useQuery({
    queryKey: ['SEARCH_BALANCE_SHEET_REPORT', parameters],
    queryFn: () => getSearchReportQuery({ ...parameters, reportType: ReportType.BALANCE_SHEET }),
    retry: false
  })

  return {
    searchedBalanceSheetReport: data ?? null,
    triggerSearchBalanceSheetReport: refetch,
    isSearchBalanceSheetReportFetching: isFetching
  }
}

export const useSearchIncomeStatementReportModel = (parameters: SearchReportRequest) => {
  const { data, refetch, isFetching } = useQuery({
    queryKey: ['SEARCH_INCOME_STATEMENT_REPORT', parameters],
    queryFn: () => getSearchReportQuery({ ...parameters, reportType: ReportType.INCOME_STATEMENT }),
    retry: false
  })

  return {
    searchedIncomeStatementReport: data ?? null,
    triggerSearchIncomeStatementReport: refetch,
    isSearchedIncomeStatementReportFetching: isFetching
  }
}
