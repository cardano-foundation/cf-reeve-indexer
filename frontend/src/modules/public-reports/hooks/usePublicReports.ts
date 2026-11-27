import { useEffect, useState } from 'react'

import { useMediaQueries } from 'hooks'
import { PAGINATION_CONFIG, usePagination } from 'libs/hooks/usePagination'
import { useSorting } from 'libs/hooks/useSorting'
import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext'
import { useModalReportView } from 'modules/public-reports/components'
import { useReportsFiltersOptions } from 'modules/public-reports/components/ReportsFilters/ReportsFilters.hooks'
import { usePublicReportsFilters } from 'modules/public-reports/hooks/usePublicReportsFilters'
import { usePublicReportsQueries } from 'modules/public-reports/hooks/usePublicReportsQueries.ts'

export const usePublicReports = () => {
  const drawer = useLayoutPublicContext()

  const filters = usePublicReportsFilters()

  useEffect(() => {
    filters.handleClearFilters()
  }, [drawer.selectedOrganisation])

  const pagination = usePagination()

  const sorting = useSorting({ field: 'period', sort: 'desc' })

  const { isTablet } = useMediaQueries()

  const paginationResetState = {
    isTablet,
    selectedOrganisation: drawer.selectedOrganisation,
    combinedFilters: filters.combinedFilters,
    sortBy: sorting.sortBy,
    sortOrder: sorting.sortOrder
  }
  const [previousPaginationResetState, setPreviousPaginationResetState] = useState(paginationResetState)

  const hasLayoutChanged = previousPaginationResetState.isTablet !== isTablet
  const hasQueryChanged =
    previousPaginationResetState.selectedOrganisation !== drawer.selectedOrganisation ||
    previousPaginationResetState.combinedFilters !== filters.combinedFilters ||
    previousPaginationResetState.sortBy !== sorting.sortBy ||
    previousPaginationResetState.sortOrder !== sorting.sortOrder

  if (hasLayoutChanged || hasQueryChanged) {
    setPreviousPaginationResetState(paginationResetState)

    if (hasLayoutChanged || isTablet) pagination.handlePagination(PAGINATION_CONFIG.PAGE, PAGINATION_CONFIG.ROWS_PER_PAGE)
  }

  const data = usePublicReportsQueries({
    filters: filters.combinedFilters,
    pagination: { page: pagination.page, size: pagination.rowsPerPage },
    sorting: { sortBy: sorting.sortBy, sortOrder: sorting.sortOrder }
  })

  const options = useReportsFiltersOptions()

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
