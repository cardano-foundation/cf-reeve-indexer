import { useFormik, useFormikContext } from 'formik'
import { noop } from 'lodash'

import { useTableToolbarContext } from 'features/common'
import { useDatesRange } from 'hooks'
import { useFormDateRangeFilterValidation } from 'libs/form-kit/validations/useFormDateRangeFilterValidation.ts'
import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext'
import { useDownloadPublicTransactionsModel } from 'libs/models/transactions-model/DownloadPublicTransactions/DownloadPublicTransactionsModel.service.ts'
import { useSnackbar } from 'libs/ui-kit/components/Snackbar/useSnackbar.tsx'
import { saveFile } from 'libs/utils/saveFile.ts'
import { usePublicTransactionsContext } from 'modules/public-transactions/components/PublicTransactionsContext/PublicTransactionsContext.hooks'
import { mapSearchFiltersToRequestBody } from 'modules/public-transactions/utils/payload.ts'

import { DEFAULT_SEARCH_QUICK_FILTERS_VALUES } from './SearchToolbar.consts'
import { SearchQuickFiltersValues } from './SearchToolbar.types'

export const useSearchQuickFiltersForm = () => {
  const validationSchema = useFormDateRangeFilterValidation()

  const quickFilters = useFormik({
    initialValues: DEFAULT_SEARCH_QUICK_FILTERS_VALUES,
    validationSchema,
    onSubmit: noop,
    enableReinitialize: true,
    validateOnChange: true
  })

  return { quickFilters }
}

export const useSearchActionControls = () => {
  const { drawer, visibilityCount, hasFiltersTouched } = useTableToolbarContext()
  const { handleDrawerClose } = useLayoutPublicContext()

  return { drawer, visibilityCount, hasFiltersTouched, onDrawerClose: handleDrawerClose }
}

export const useSearchExport = () => {
  const { selectedOrganisation } = useLayoutPublicContext()
  const { filters } = usePublicTransactionsContext()
  const { triggerDownloadTransactions, isDownloadPending } = useDownloadPublicTransactionsModel()
  const { isSnackbarVisible, showSnackbar, handleClose } = useSnackbar()

  const handleExport = async () => {
    if (!selectedOrganisation) return

    const filtersPayload = mapSearchFiltersToRequestBody(filters.combinedFilters)
    const hasSomeFilters = Object.values(filtersPayload).some((value) => Boolean(value))

    try {
      const csv = await triggerDownloadTransactions({ body: { organisationId: selectedOrganisation, ...(hasSomeFilters ? filtersPayload : {}) } })
      if (csv === null) throw new Error('Empty CSV response')
      saveFile(csv, `transactions_${selectedOrganisation}.csv`, 'text/csv')
    } catch {
      showSnackbar()
    }
  }

  return { isExportPending: isDownloadPending, handleExport, isSnackbarVisible, handleSnackbarClose: handleClose }
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
