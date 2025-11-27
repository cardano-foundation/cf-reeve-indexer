import { useFormik } from 'formik'
import { noop } from 'lodash'

import { useTableToolbarContext } from 'features/common'
import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext'
import { usePublicReportsContext } from 'modules/public-reports/components/PublicReportsContext/PublicReportsContext.hooks'

import { DEFAULT_REPORTS_QUICK_FILTERS_VALUES } from './ReportsToolbar.consts'

export const useReportsQuickFiltersForm = () => {
  const quickFilters = useFormik({
    initialValues: DEFAULT_REPORTS_QUICK_FILTERS_VALUES,
    onSubmit: noop,
    enableReinitialize: true,
    validateOnChange: true
  })

  return { quickFilters }
}

export const useReportsActionControls = () => {
  const { drawer, visibilityCount, hasFiltersTouched } = useTableToolbarContext()

  return { drawer, visibilityCount, hasFiltersTouched }
}

export const useReportsQuickFilters = () => {
  useTableToolbarContext()
}

export const useReportsToolbar = () => {
  const { type, handleDrawerOpen, isDrawerOpen } = useLayoutPublicContext()

  const { filters, options } = usePublicReportsContext()

  return { drawer: { type, onDrawerOpen: handleDrawerOpen, isDrawerOpen }, filters, options }
}
