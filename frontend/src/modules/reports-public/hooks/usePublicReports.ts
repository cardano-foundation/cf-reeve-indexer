import { useModalReportView } from 'modules/reporting/components'
import { usePublicReportsForm } from 'modules/reports-public/hooks/usePublicReportsForm.ts'
import { usePublicReportsQueries } from 'modules/reports-public/hooks/usePublicReportsQueries.ts'

export const usePublicReports = () => {
  const { formik, areFiltersSelected } = usePublicReportsForm()

  const { reports, isFetching } = usePublicReportsQueries({ formik })

  const { report, handleReportViewClose, handleReportViewOpen, isReportViewOpen } = useModalReportView()

  const hasEmptyPageState = !isFetching && !areFiltersSelected && reports?.length === 0

  return {
    formik,
    report,
    reports,
    handleReportViewClose,
    handleReportViewOpen,
    areFiltersSelected,
    hasEmptyPageState,
    isFetching,
    isReportViewOpen
  }
}
