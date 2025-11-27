import { useFormik } from 'formik'
import { noop } from 'lodash'

import { getAllReportPeriodOptions, getAllReportTypeOptions } from 'libs/utils/formFieldOptions'

import { DEFAULT_REPORTS_FILTERS_VALUES } from './ReportsFilters.consts'

export const useReportsFiltersOptions = () => {
  const periodOptions = getAllReportPeriodOptions()
  const reportOptions = getAllReportTypeOptions()

  return { periodOptions, reportOptions }
}

export const useReportsDrawerFiltersForm = () => {
  const filters = useFormik({
    initialValues: DEFAULT_REPORTS_FILTERS_VALUES,
    onSubmit: noop,
    enableReinitialize: true,
    validateOnChange: true
  })

  return { filters }
}
