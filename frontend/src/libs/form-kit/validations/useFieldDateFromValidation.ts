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
    .min(dateFromMinDate.isValid() ? dateFromMinDate : dayjs(DEFUALT_MIN_DATE), t({ id: 'invalidPeriod' }))
    .max(dateFromMaxDate.isValid() ? dateFromMaxDate : dayjs(), t({ id: 'invalidPeriod' }))
    .when('dateTo', (values, schema) => {
      const [dateTo] = values

      if (dateTo && dayjs(dateTo).isValid()) {
        return schema.max(dateTo, t({ id: 'invalidPeriod' }))
      }

      return schema
    })
    .typeError(t({ id: 'invalidPeriod' }))
}
