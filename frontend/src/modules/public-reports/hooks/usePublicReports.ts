import { usePagination } from 'libs/hooks/usePagination'
import { useSorting } from 'libs/hooks/useSorting'
import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext'
import { useModalReportView } from 'modules/public-reports/components'
import { usePublicReportsQueries } from 'modules/public-reports/hooks/usePublicReportsQueries.ts'
import { useReportsFiltersOptions } from 'modules/public-reports/components/ReportsFilters/ReportsFilters.hooks'
import { usePublicReportsFilters } from 'modules/public-reports/hooks/usePublicReportsFilters'

export const usePublicReports = () => {
  const drawer = useLayoutPublicContext()

  const filters = usePublicReportsFilters()

  const pagination = usePagination()

  const sorting = useSorting({ field: 'period', sort: 'desc' })

  const options = useReportsFiltersOptions()

  const data = usePublicReportsQueries({
    filters: filters.combinedFilters,
    pagination: { page: pagination.page, size: pagination.rowsPerPage },
    sorting: { sortBy: sorting.sortBy, sortOrder: sorting.sortOrder }
  })

  const modal = useModalReportView()

  const hasEmptyPageState = !data.isFetching && !filters.hasFiltersSelected && !data.reports?.reports.length

  return {
    data: { ...data, hasEmptyPageState },
    drawer,
    filters,
    options,
    pagination,
    sorting,
    modal
  }
}
