import { usePagination } from 'libs/hooks/usePagination.ts'
import { useSorting } from 'libs/hooks/useSorting'
import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext.ts'
import { useSearchFiltersOptions } from 'modules/public-events/components/SearchFilters/SearchFilters.hooks.ts'
import { usePublicEventsFilters } from 'modules/public-events/hooks/usePublicEventsFilters.ts'
import { usePublicEventsQueries } from 'modules/public-events/hooks/usePublicEventsQueries.ts'

export const usePublicEvents = (lockedProjectId?: string | null) => {
  const drawer = useLayoutPublicContext()

  const filters = usePublicEventsFilters(lockedProjectId)

  const pagination = usePagination()

  const sorting = useSorting({ field: 'date', sort: 'desc' })

  const options = useSearchFiltersOptions()

  const data = usePublicEventsQueries({
    filters: filters.combinedFilters,
    pagination: { page: pagination.page, size: pagination.rowsPerPage },
    sorting: { sortBy: sorting.sortBy, sortOrder: sorting.sortOrder }
  })

  const hasEmptyPageState = !data.isFetching && !filters.hasFiltersSelected && !data.events?.events?.length

  return {
    data: { ...data, hasEmptyPageState },
    drawer,
    filters,
    options,
    pagination,
    sorting
  }
}
