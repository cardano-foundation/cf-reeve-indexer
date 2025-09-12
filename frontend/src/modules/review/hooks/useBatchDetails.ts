import { useEffect, useMemo, useState } from 'react'

import { DEFAULT_DRAWER_FILTERS_VALUES, DEFAULT_QUICK_FILTERS_VALUES, useBatchDetailsDrawerFilters, useBatchDetailsQuickFilters } from 'features/ui'
import type { BatchDetailsFiltersValues, BatchDetailsQuickFiltersValues } from 'features/ui'
import { usePrevious } from 'hooks'

interface UseBatchDetailsProps {
  onApplyFilters?: (payload: Partial<BatchDetailsFiltersValues>) => void
}

const useBatchDetailsFilters = ({ onApplyFilters }: UseBatchDetailsProps = {}) => {
  // State to hold initial values for Formik forms
  const [initialQuickFiltersValues, setInitialQuickFiltersValues] = useState<BatchDetailsQuickFiltersValues>(DEFAULT_QUICK_FILTERS_VALUES)
  const [initialFiltersValues, setInitialFiltersValues] = useState<BatchDetailsFiltersValues>(DEFAULT_DRAWER_FILTERS_VALUES)

  // Initialize Formik hooks for drawer and quick filters
  const { quickFilters } = useBatchDetailsQuickFilters({ initialValues: initialQuickFiltersValues })
  const { filters } = useBatchDetailsDrawerFilters({
    initialValues: initialFiltersValues,
    onApplyFilters // lift filtered payload to parent
  })

  // Track previous submit count to detect Apply
  const prevSubmitCount = usePrevious(filters.submitCount)

  // Count how many filter fields are active (ignoring quick filters overlap)
  const count = useMemo(
    () =>
      Object.entries(filters.values).reduce((acc, [key, value]) => {
        const hasProperty = Object.keys(quickFilters.values).includes(key)
        const hasValue = Array.isArray(value) ? value.length > 0 : Boolean(value)
        return !hasProperty && hasValue ? acc + 1 : acc
      }, 0),
    [filters.submitCount, filters.values, quickFilters.values]
  )

  const areFiltersSubmitted = Number(prevSubmitCount) < filters.submitCount
  const isClearDisabled = !filters.dirty && !quickFilters.dirty
  const isApplyDisabled = !filters.dirty && !quickFilters.dirty

  // Reset both drawer and quick filters
  const handleClearFilters = () => {
    filters.resetForm({ values: DEFAULT_DRAWER_FILTERS_VALUES, touched: {} })
    quickFilters.resetForm({ values: DEFAULT_QUICK_FILTERS_VALUES, touched: {} })
  }

  // Sync quick filters with drawer filters after submit
  useEffect(() => {
    if (filters.dirty && areFiltersSubmitted) {
      setInitialQuickFiltersValues({
        ...quickFilters.values,
        dateFrom: filters.values.dateFrom,
        dateTo: filters.values.dateTo,
        transactionType: filters.values.transactionType
      })
    }
  }, [filters.values, filters.dirty, quickFilters.values, areFiltersSubmitted])

  // Sync drawer filters with quick filters when quick filters change
  useEffect(() => {
    if (quickFilters.dirty) {
      setInitialFiltersValues({
        ...filters.values,
        dateFrom: quickFilters.values.dateFrom,
        dateTo: quickFilters.values.dateTo,
        transactionType: quickFilters.values.transactionType
      })
    }
  }, [filters.values, quickFilters.values, quickFilters.dirty])

  return {
    count,
    filters,
    quickFilters,
    handleClearFilters,
    areFiltersSubmitted,
    isApplyDisabled,
    isClearDisabled
  }
}

/**
 * Public hook used by parent component / view
 */
export const useBatchDetails = ({ onApplyFilters }: UseBatchDetailsProps = {}) => {
  const { count, filters, quickFilters, handleClearFilters, areFiltersSubmitted, isApplyDisabled, isClearDisabled } = useBatchDetailsFilters({ onApplyFilters })

  return { count, filters, quickFilters, handleClearFilters, areFiltersSubmitted, isApplyDisabled, isClearDisabled }
}
