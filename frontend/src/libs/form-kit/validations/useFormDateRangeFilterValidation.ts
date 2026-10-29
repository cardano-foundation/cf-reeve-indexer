import * as Yup from 'yup'

import { useDatesRange } from 'hooks'
import { useFieldDateFromValidation } from 'libs/form-kit/validations/useFieldDateFromValidation.ts'
import { useFieldDateToValidation } from 'libs/form-kit/validations/useFieldDateToValidation.ts'

export const useFormDateRangeFilterValidation = () => {
  const { dateFromMaxDate, dateFromMinDate, dateToMaxDate, dateToMinDate } = useDatesRange()

  const fieldDateFromValidation = useFieldDateFromValidation({ dateFromMaxDate, dateFromMinDate })
  const fieldDateToValidation = useFieldDateToValidation({ dateToMaxDate, dateToMinDate })

  return Yup.object().shape(
    {
      dateFrom: fieldDateFromValidation,
      dateTo: fieldDateToValidation
    },
    [['dateFrom', 'dateTo']]
  )
}
