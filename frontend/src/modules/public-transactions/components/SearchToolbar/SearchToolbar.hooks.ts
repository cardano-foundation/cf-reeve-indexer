import { useFormik, useFormikContext } from 'formik'
import { noop } from 'lodash'

import { useTableToolbarContext } from 'features/common'
import { useDatesRange } from 'hooks'
import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext'
import { usePublicTransactionsContext } from 'modules/public-transactions/components/PublicTransactionsContext/PublicTransactionsContext.hooks'

import { DEFAULT_SEARCH_QUICK_FILTERS_VALUES } from './SearchToolbar.consts'
import { SearchQuickFiltersValues } from './SearchToolbar.types'

export const useSearchQuickFiltersForm = () => {
  const quickFilters = useFormik({
    initialValues: DEFAULT_SEARCH_QUICK_FILTERS_VALUES,
    onSubmit: noop,
    enableReinitialize: true,
    validateOnChange: true
  })

  return { quickFilters }
}

export const useSearchActionControls = () => {
  const { drawer, visibilityCount, hasFiltersTouched } = useTableToolbarContext()

  return { drawer, visibilityCount, hasFiltersTouched }
}

export const useSearchQuickFilters = () => {
  const { values } = useFormikContext<SearchQuickFiltersValues>()

  const { dateFromMaxDate, dateFromMinDate, dateToMaxDate, dateToMinDate } = useDatesRange()

  useTableToolbarContext()

  return { dateFromMaxDate, dateFromMinDate, dateToMaxDate, dateToMinDate, values }
}

export const useSearchToolbar = () => {
  const { type, handleDrawerOpen, isDrawerOpen } = useLayoutPublicContext()

  const { filters, options } = usePublicTransactionsContext()

  return {
    drawer: { type, onDrawerOpen: handleDrawerOpen, isDrawerOpen },
    filters,
    options
  }
}
