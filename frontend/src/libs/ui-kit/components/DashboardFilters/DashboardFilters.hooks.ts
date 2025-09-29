import dayjs from 'dayjs'
import { useFormik } from 'formik'
import { noop } from 'lodash'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { DashboardFiltersFormValues } from 'libs/ui-kit/components/DashboardFilters/DashboardFilters.types.ts'

export const useDashboardFiltersForm = () => {
  const { t } = useTranslations()

  const initialValues: DashboardFiltersFormValues = {
    period: t({ id: 'reportPeriod' }, { year: dayjs().year() - 1, period: t({ id: 'fullYear' }) })
  }

  const formik = useFormik({
    initialValues,
    onSubmit: noop,
    enableReinitialize: true
  })

  return { formik }
}
