import dayjs, { Dayjs } from 'dayjs'
import * as Yup from 'yup'

import { DEFUALT_MIN_DATE } from 'libs/const/dates.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'

interface FieldDateFromValidationState {
  dateFromMaxDate: Dayjs
  dateFromMinDate: Dayjs
}

export const useFieldDateFromValidation = (state: FieldDateFromValidationState) => {
  const { dateFromMinDate, dateFromMaxDate } = state

  const { t } = useTranslations()

  return Yup.date()
    .nullable()
    .transform((value, originalValue) => (dayjs.isDayjs(originalValue) ? originalValue.toDate() : value))
    .min(dateFromMinDate.isValid() ? dateFromMinDate : dayjs(DEFUALT_MIN_DATE), t({ id: 'invalidPeriod' }))
    .max(dateFromMaxDate.isValid() ? dateFromMaxDate : dayjs(), t({ id: 'invalidPeriod' }))
    .typeError(t({ id: 'invalidPeriod' }))
}
