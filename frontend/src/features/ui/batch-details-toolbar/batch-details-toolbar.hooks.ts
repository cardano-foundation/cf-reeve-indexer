import { useFormik } from 'formik'
import { noop } from 'lodash'

import { useLayoutAuthContext } from 'libs/layout-kit/layout-auth/hooks/useLayoutAuthContext'
import { useBatchDetailsContext } from 'modules/review/hooks/useBatchDetailsContext'

import type { BatchDetailsQuickFiltersState } from './batch-details-toolbar.types'

export const useBatchDetailsQuickFilters = (state: BatchDetailsQuickFiltersState) => {
  const { initialValues } = state

  const quickFilters = useFormik({
    initialValues,
    onSubmit: noop,
    enableReinitialize: true,
    validateOnChange: true
  })

  return { quickFilters }
}

export const useBatchDetailsToolbar = () => {
  const { type, handleDrawerOpen, isDrawerOpen } = useLayoutAuthContext()

  const { count } = useBatchDetailsContext()

  return { type, handleDrawerOpen, isDrawerOpen, count }
}
