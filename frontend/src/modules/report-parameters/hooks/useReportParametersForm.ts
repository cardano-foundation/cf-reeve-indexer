import { useFormik } from 'formik'
import { noop } from 'lodash'

import { ReportParametersFormValues } from 'modules/report-parameters/components/ReportParametersForm/ReportParametersForm.types.ts'
import { ReportTypeLocationState } from 'modules/report-parameters/hooks/useReportParameters.ts'

interface ReportParametersFormState {
  locationState: ReportTypeLocationState | null
}

export const useReportParametersForm = (state: ReportParametersFormState) => {
  const { locationState } = state

  const initialValues = {
    currency: locationState?.currency ?? '',
    period: locationState?.period ?? '',
    report: locationState?.reportType ?? '',
    isAutomaticGeneration: locationState?.isAutomaticGeneration ?? false
  } as ReportParametersFormValues

  const formik = useFormik({
    initialValues,
    onSubmit: noop,
    enableReinitialize: true
  })

  const areParametersSelected = Boolean(formik.values?.period && formik.values?.report && formik.values?.currency)

  return {
    formik,
    areParametersSelected
  }
}
