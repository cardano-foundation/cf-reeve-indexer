import { useFilters } from 'hooks'
import { DEFAULT_SEARCH_FILTERS_VALUES } from 'modules/public-transactions/components/SearchFilters/SearchFilters.consts.ts'
import { useSearchDrawerFiltersForm } from 'modules/public-transactions/components/SearchFilters/SearchFilters.hooks.ts'
import { DEFAULT_SEARCH_QUICK_FILTERS_VALUES } from 'modules/public-transactions/components/SearchToolbar/SearchToolbar.consts.ts'
import { useSearchQuickFiltersForm } from 'modules/public-transactions/components/SearchToolbar/SearchToolbar.hooks.ts'

export const usePublicTransactionsFilters = () => {
  const { quickFilters } = useSearchQuickFiltersForm()
  const { filters } = useSearchDrawerFiltersForm()

  const { combinedFilters, handleClearFilters, hasFiltersSelected, hasFiltersTouched, isApplyDisabled, isClearDisabled } = useFilters({
    initialFiltersValues: DEFAULT_SEARCH_FILTERS_VALUES,
    initialQuickFiltersValues: DEFAULT_SEARCH_QUICK_FILTERS_VALUES,
    filters,
    quickFilters
  })

  return {
    combinedFilters,
    filters,
    quickFilters,
    handleClearFilters,
    hasFiltersSelected,
    hasFiltersTouched,
    isApplyDisabled,
    isClearDisabled
  }
}
