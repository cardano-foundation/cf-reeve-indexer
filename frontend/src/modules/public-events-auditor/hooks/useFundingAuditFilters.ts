import { useFormik } from 'formik'
import { noop } from 'lodash'

import { useFormDateRangeFilterValidation } from 'libs/form-kit/validations/useFormDateRangeFilterValidation.ts'
import { type AuditFilterValues } from 'modules/public-events-auditor/components/AuditFilterBar/AuditFilterBar.component.tsx'

export const useFundingAuditFilters = () => {
  const validationSchema = useFormDateRangeFilterValidation()

  const dateFilters = useFormik<AuditFilterValues>({
    initialValues: { dateFrom: null, dateTo: null },
    validationSchema,
    onSubmit: noop
  })

  return { dateFilters }
}
