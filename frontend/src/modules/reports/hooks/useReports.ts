import { useModalReportView } from 'modules/reporting/components'
import { useReportsQueries } from 'modules/reports/hooks/useReportsQueries.ts'

export const useReports = () => {
  const { reports, isFetching } = useReportsQueries()

  const { report, handleReportViewClose, handleReportViewOpen, isReportViewOpen } = useModalReportView()

  return { report, reports, handleReportViewClose, handleReportViewOpen, isFetching, isReportViewOpen }
}
