import { useFormik } from 'formik'
import { noop } from 'lodash'

import { ReportEntity } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types'
import { getAllReportPeriodOptions, getAllReportTypeOptions, getReportStandardOptions } from 'libs/utils/formFieldOptions'

import { DEFAULT_REPORTS_FILTERS_VALUES } from './ReportsFilters.consts'

export const useReportsFiltersOptions = (reports?: ReportEntity[] | null) => {
  const periodOptions = getAllReportPeriodOptions()
  const reportOptions = getAllReportTypeOptions()
  const standardOptions = getReportStandardOptions(reports)

  return { periodOptions, reportOptions, standardOptions }
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
