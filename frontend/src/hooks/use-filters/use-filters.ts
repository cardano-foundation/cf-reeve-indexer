import { FormikContextType } from 'formik'
import { useEffect, useState } from 'react'

import { useDebounce } from 'hooks'

interface FiltersState<FiltersValues extends Record<string, unknown>, QuickFiltersValues extends Record<string, unknown>> {
  initialFiltersValues: FiltersValues
  initialQuickFiltersValues: QuickFiltersValues
  filters: FormikContextType<FiltersValues>
  quickFilters: FormikContextType<QuickFiltersValues>
}

export const useFilters = <FiltersValues extends Record<string, unknown>, QuickFiltersValues extends Record<string, unknown>>(
  state: FiltersState<FiltersValues, QuickFiltersValues>
) => {
  const { initialFiltersValues, initialQuickFiltersValues, filters, quickFilters } = state

  const [combinedFilters, setCombinedFilters] = useState<FiltersValues & QuickFiltersValues>({ ...initialQuickFiltersValues, ...initialFiltersValues })

  const debouncedQuickFilters = useDebounce(quickFilters.values)

  const hasFiltersSelected = Object.values(combinedFilters).some((value) => (Array.isArray(value) ? value.length > 0 : Boolean(value)))
  const hasFiltersTouched = filters.dirty && Object.values(filters.touched).some((touched) => Boolean(touched))

  const areBothFiltersPristine = !filters.dirty && !quickFilters.dirty
  const isInitialFiltersState = JSON.stringify(combinedFilters) === JSON.stringify({ ...initialQuickFiltersValues, ...initialFiltersValues })
  const isClearDisabled = areBothFiltersPristine && isInitialFiltersState
  const isApplyDisabled = areBothFiltersPristine && isInitialFiltersState

  const handleClearFilters = () => {
    filters.resetForm({ values: initialFiltersValues, touched: {} })
    quickFilters.resetForm({ values: initialQuickFiltersValues, touched: {} })
  }

  useEffect(() => {
    Object.entries(quickFilters.values).forEach(([key, value]) => {
      if (Object.prototype.hasOwnProperty.call(filters.values, key)) {
        filters.setFieldValue(key, value)
      }
    })
  }, [quickFilters.values, filters.setFieldValue])

  useEffect(() => {
    Object.entries(filters.values).forEach(([key, value]) => {
      if (Object.prototype.hasOwnProperty.call(quickFilters.values, key)) {
        quickFilters.setFieldValue(key, value)
      }
    })
  }, [filters.submitCount, quickFilters.setFieldValue])

  useEffect(() => {
    setCombinedFilters((prevState) => ({ ...prevState, ...debouncedQuickFilters }))
  }, [debouncedQuickFilters])

  useEffect(() => {
    setCombinedFilters((prevState) => ({ ...prevState, ...filters.values }))
  }, [filters.submitCount])

  return { combinedFilters, handleClearFilters, hasFiltersSelected, hasFiltersTouched, isApplyDisabled, isClearDisabled }
}
