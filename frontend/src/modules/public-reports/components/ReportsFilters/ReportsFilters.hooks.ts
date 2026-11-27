import { useFormik } from 'formik'

import { useMediaQueries } from 'hooks'
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
  const { handleDrawerClose } = useLayoutPublicContext()
  const { isTablet } = useMediaQueries()

  const filters = useFormik({
    initialValues: DEFAULT_REPORTS_FILTERS_VALUES,
    onSubmit: () => {
      if (isTablet) handleDrawerClose()
    },
    enableReinitialize: true,
    validateOnChange: true
  })

  return { filters }
}
