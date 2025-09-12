import { Dayjs } from 'dayjs'
import * as Yup from 'yup'

import { useFieldDateFromValidation } from 'libs/form-kit/validations/useFieldDateFromValidation.ts'
import { useFieldDateToValidation } from 'libs/form-kit/validations/useFieldDateToValidation.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'

interface FormExtractionValidationState {
  dateFromMinDate: Dayjs
  dateFromMaxDate: Dayjs
  dateToMinDate: Dayjs
  dateToMaxDate: Dayjs
}

export const useFormExtractionValidation = (state: FormExtractionValidationState) => {
  const { dateFromMinDate, dateFromMaxDate, dateToMinDate, dateToMaxDate } = state

  const { t } = useTranslations()

  const fieldDateFromValidation = useFieldDateFromValidation({ dateFromMaxDate, dateFromMinDate })
  const fieldDateToValidation = useFieldDateToValidation({ dateToMaxDate, dateToMinDate })

  return Yup.object().shape(
    {
      dateFrom: fieldDateFromValidation.required(t({ id: 'dateIsRequired' })),
      dateTo: fieldDateToValidation.required(t({ id: 'dateIsRequired' })),
      costCenter: Yup.array().of(Yup.string().nullable().optional()).optional(),
      project: Yup.array().of(Yup.string().nullable().optional()).optional(),
      accountType: Yup.array().of(Yup.string().nullable().optional()).optional(),
      accountSubtype: Yup.array().of(Yup.string().nullable().optional()).optional(),
      accountCode: Yup.array().of(Yup.string().nullable().optional()).optional()
    },
    [['dateFrom', 'dateTo']]
  )
}
