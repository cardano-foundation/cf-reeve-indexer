import { useFilters } from 'hooks'
import { DEFAULT_REPORTS_FILTERS_VALUES } from 'modules/public-reports/components/ReportsFilters/ReportsFilters.consts'
import { useReportsDrawerFiltersForm } from 'modules/public-reports/components/ReportsFilters/ReportsFilters.hooks'
import { DEFAULT_REPORTS_QUICK_FILTERS_VALUES } from 'modules/public-reports/components/ReportsToolbar/ReportsToolbar.consts'
import { useReportsQuickFiltersForm } from 'modules/public-reports/components/ReportsToolbar/ReportsToolbar.hooks'

export const usePublicReportsFilters = () => {
  const { quickFilters } = useReportsQuickFiltersForm()
  const { filters } = useReportsDrawerFiltersForm()

  const { combinedFilters, handleClearFilters, hasFiltersSelected, hasFiltersTouched, isApplyDisabled, isClearDisabled } = useFilters({
    initialFiltersValues: DEFAULT_REPORTS_FILTERS_VALUES,
    initialQuickFiltersValues: DEFAULT_REPORTS_QUICK_FILTERS_VALUES,
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
