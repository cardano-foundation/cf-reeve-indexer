import { usePagination } from 'libs/hooks/usePagination.ts'
import { useSorting } from 'libs/hooks/useSorting'
import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext.ts'
import { useSearchFiltersOptions } from 'modules/public-transactions/components/SearchFilters/SearchFilters.hooks.ts'
import { usePublicTransactionsFilters } from 'modules/public-transactions/hooks/usePublicTransactionsFilters.ts'
import { usePublicTransactionsQueries } from 'modules/public-transactions/hooks/usePublicTransactionsQueries.ts'

export const usePublicTransactions = () => {
  const drawer = useLayoutPublicContext()

  const filters = usePublicTransactionsFilters()

  const pagination = usePagination()

  const sorting = useSorting({ field: 'entryDate', sort: 'desc' })

  const options = useSearchFiltersOptions()

  const data = usePublicTransactionsQueries({
    filters: filters.combinedFilters,
    pagination: { page: pagination.page, size: pagination.rowsPerPage },
    sorting: { sortBy: sorting.sortBy, sortOrder: sorting.sortOrder }
  })

  const hasEmptyPageState = !data.isFetching && !filters.hasFiltersSelected && !data.transactions?.transactions?.length

  return {
    data: { ...data, hasEmptyPageState },
    drawer,
    filters,
    options,
    pagination,
    sorting
  }
}
