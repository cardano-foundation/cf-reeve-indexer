import { useFormik } from 'formik'
import { noop } from 'lodash'

import { PublicReportsFiltersFormValues } from 'modules/reports-public/components/Filters/Filters.types.ts'

export const usePublicReportsForm = () => {
  const initialValues: PublicReportsFiltersFormValues = {
    period: '',
    report: ''
  }

  const formik = useFormik({
    initialValues,
    onSubmit: noop,
    enableReinitialize: true
  })

  const { values } = formik

  const areFiltersSelected = Boolean(values?.period || values?.report)

  return {
    formik,
    areFiltersSelected
  }
}
