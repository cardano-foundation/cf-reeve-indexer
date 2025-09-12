import dayjs from 'dayjs'
import { useFormik } from 'formik'

import type { BatchDetailsFiltersValues, BatchDetailsDrawerFiltersState } from './batch-details-filters.types'
import { mapFiltersToApiParams } from './mapFiltersToApiParams'

// Utility: check if a field has a real value
const hasValue = (val: unknown): boolean => {
  if (Array.isArray(val)) return val.length > 0
  if (dayjs.isDayjs(val)) return true
  return val !== '' && val !== null && val !== undefined
}

export const useBatchDetailsDrawerFilters = (state: BatchDetailsDrawerFiltersState) => {
  const { initialValues, onApplyFilters } = state

  const filters = useFormik({
    initialValues: {
      ...initialValues,
      dateFrom: initialValues.dateFrom ? dayjs(initialValues.dateFrom) : null,
      dateTo: initialValues.dateTo ? dayjs(initialValues.dateTo) : null
    },
    onSubmit: (values) => {
      // Normalize dates safely
      const normalizedValues: BatchDetailsFiltersValues = {
        ...values,
        dateFrom: values.dateFrom ? dayjs(values.dateFrom) : null,
        dateTo: values.dateTo ? dayjs(values.dateTo) : null
      }

      // Keep only fields with actual values
      const filteredValues = (Object.keys(normalizedValues) as (keyof BatchDetailsFiltersValues)[])
        .filter((key) => hasValue(normalizedValues[key]))
        .reduce((acc, key) => ({ ...acc, [key]: normalizedValues[key] }), {} as Partial<BatchDetailsFiltersValues>)

      // Map to API payload
      const filtersPayload = mapFiltersToApiParams(filteredValues)

      if (onApplyFilters) onApplyFilters(filtersPayload)
    },
    enableReinitialize: true,
    validateOnChange: false, // ✅ no auto-refresh while typing/selecting
    validateOnBlur: false // ✅ no auto-refresh when blurring inputs
  })

  return { filters }
}
