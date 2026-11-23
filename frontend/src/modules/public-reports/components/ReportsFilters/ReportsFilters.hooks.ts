import { useFormik } from 'formik'
import { noop } from 'lodash'

import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext'
import { useGetOrganisationAccountingRegimesModel } from 'libs/models/organisation-model/GetOrganisationAccountingRegimes/GetOrganisationAccountingRegimes.service'
import { getAllReportPeriodOptions, getAllReportTypeOptions } from 'libs/utils/formFieldOptions'
import { getReportStandardOptions } from 'modules/public-reports/utils/format'

import { DEFAULT_REPORTS_FILTERS_VALUES } from './ReportsFilters.consts'

export const useReportsFiltersOptions = () => {
  const { selectedOrganisation } = useLayoutPublicContext()
  const isOrganisationSelected = Boolean(selectedOrganisation)

  const { accountingRegimes } = useGetOrganisationAccountingRegimesModel({ parameters: { organisationId: selectedOrganisation } }, isOrganisationSelected)

  const periodOptions = getAllReportPeriodOptions()
  const reportOptions = getAllReportTypeOptions()
  const standardOptions = getReportStandardOptions(accountingRegimes)

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
