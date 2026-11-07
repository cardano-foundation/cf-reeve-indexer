import { usePagination } from 'libs/hooks/usePagination'
import { useSorting } from 'libs/hooks/useSorting'
import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext'
import { useModalReportView } from 'modules/public-reports/components'
import { REPORT_STANDARD_NOT_STATED_VALUE } from 'modules/public-reports/components/ReportsFilters/ReportsFilters.consts'
import { useReportsFiltersOptions } from 'modules/public-reports/components/ReportsFilters/ReportsFilters.hooks'
import { usePublicReportsFilters } from 'modules/public-reports/hooks/usePublicReportsFilters'
import { usePublicReportsQueries } from 'modules/public-reports/hooks/usePublicReportsQueries.ts'
import { getReportStandard } from 'modules/public-reports/utils/format'

export const usePublicReports = () => {
  const drawer = useLayoutPublicContext()

  const filters = usePublicReportsFilters()

  const pagination = usePagination()

  const sorting = useSorting({ field: 'period', sort: 'desc' })

  const data = usePublicReportsQueries({
    filters: { ...filters.combinedFilters, standard: [] },
    pagination: { page: pagination.page, size: pagination.rowsPerPage },
    sorting: { sortBy: sorting.sortBy, sortOrder: sorting.sortOrder }
  })

  const options = useReportsFiltersOptions(data.reports?.reports)

  const modal = useModalReportView()

  const hasEmptyPageState = !data.isFetching && !filters.hasFiltersSelected && !data.reports?.reports.length

  const { standard } = filters.combinedFilters

  const reports =
    data.reports && standard.length
      ? { ...data.reports, reports: data.reports.reports.filter((report) => standard.includes(getReportStandard(report.accountingRegime) ?? REPORT_STANDARD_NOT_STATED_VALUE)) }
      : data.reports

  return {
    data: { ...data, reports, hasEmptyPageState },
    drawer,
    filters,
    options,
    pagination,
    sorting,
    modal
  }
}
