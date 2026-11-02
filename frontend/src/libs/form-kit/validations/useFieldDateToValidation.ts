import dayjs, { Dayjs } from 'dayjs'
import * as Yup from 'yup'

import { DEFUALT_MIN_DATE } from 'libs/const/dates.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'

interface FieldDateToValidationState {
  dateToMaxDate: Dayjs
  dateToMinDate: Dayjs
}

export const useFieldDateToValidation = (state: FieldDateToValidationState) => {
  const { dateToMinDate, dateToMaxDate } = state

  const { t } = useTranslations()

  return Yup.date()
    .nullable()
    .transform((value, originalValue) => (dayjs.isDayjs(originalValue) ? originalValue.toDate() : value))
    .min(dateToMinDate.isValid() ? dateToMinDate : dayjs(DEFUALT_MIN_DATE), t({ id: 'invalidPeriod' }))
    .max(dateToMaxDate.isValid() ? dateToMaxDate : dayjs(), t({ id: 'invalidPeriod' }))
    .when('dateFrom', (values, schema) => {
      const [dateFrom] = values

      if (dateFrom && dayjs(dateFrom).isValid()) {
        return schema.test('dateToBeforeDateFrom', t({ id: 'dateToBeforeDateFrom' }), (value) => !value || !dayjs(value).isBefore(dateFrom))
      }

      return schema
    })
    .typeError(t({ id: 'invalidPeriod' }))
}
