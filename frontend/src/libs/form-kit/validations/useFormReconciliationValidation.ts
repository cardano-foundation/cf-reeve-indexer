import { Dayjs } from 'dayjs'
import * as Yup from 'yup'

import { useFieldDateFromValidation } from 'libs/form-kit/validations/useFieldDateFromValidation.ts'
import { useFieldDateToValidation } from 'libs/form-kit/validations/useFieldDateToValidation.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'

interface FormReconciliationValidationState {
  dateFromMinDate: Dayjs
  dateFromMaxDate: Dayjs
  dateToMinDate: Dayjs
  dateToMaxDate: Dayjs
}

export const useFormReconciliationValidation = (state: FormReconciliationValidationState) => {
  const { dateFromMinDate, dateFromMaxDate, dateToMinDate, dateToMaxDate } = state

  const { t } = useTranslations()

  const fieldDateFromValidation = useFieldDateFromValidation({ dateFromMaxDate, dateFromMinDate })
  const fieldDateToValidation = useFieldDateToValidation({ dateToMaxDate, dateToMinDate })

  return Yup.object().shape(
    {
      dateFrom: fieldDateFromValidation.required(t({ id: 'dateIsRequired' })),
      dateTo: fieldDateToValidation.required(t({ id: 'dateIsRequired' }))
    },
    [['dateFrom', 'dateTo']]
  )
}
