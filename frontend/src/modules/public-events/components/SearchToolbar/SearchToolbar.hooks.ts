import { useFormik, useFormikContext } from 'formik'
import { noop } from 'lodash'

import { useTableToolbarContext } from 'features/common'
import { useDatesRange } from 'hooks'
import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext'
import { usePublicEventsContext } from 'modules/public-events/components/PublicEventsContext/PublicEventsContext.hooks'

import { DEFAULT_SEARCH_QUICK_FILTERS_VALUES } from './SearchToolbar.consts'
import { SearchQuickFiltersValues } from './SearchToolbar.types'

export const useSearchQuickFiltersForm = (lockedProjectId?: string | null) => {
  const quickFilters = useFormik({
    initialValues: { ...DEFAULT_SEARCH_QUICK_FILTERS_VALUES, project: lockedProjectId ? [lockedProjectId] : DEFAULT_SEARCH_QUICK_FILTERS_VALUES.project },
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

  const { filters, options } = usePublicEventsContext()

  return {
    drawer: { type, onDrawerOpen: handleDrawerOpen, isDrawerOpen },
    filters,
    options
  }
}
