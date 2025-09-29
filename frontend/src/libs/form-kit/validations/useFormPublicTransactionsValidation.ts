import { Dayjs } from 'dayjs'
import * as Yup from 'yup'

import { useFieldBlockchainHashValidation } from 'libs/form-kit/validations/useFieldBlockchainHashValidation.ts'
import { useFieldDateFromValidation } from 'libs/form-kit/validations/useFieldDateFromValidation.ts'
import { useFieldDateToValidation } from 'libs/form-kit/validations/useFieldDateToValidation.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { formatToFloatReadyFormat } from 'modules/public-reports/utils/format.ts'

interface UseFormPublicTransactionsValidationState {
  dateFromMinDate: Dayjs
  dateFromMaxDate: Dayjs
  dateToMinDate: Dayjs
  dateToMaxDate: Dayjs
}

export const useFormPublicTransactionsValidation = (state: UseFormPublicTransactionsValidationState) => {
  const { dateFromMinDate, dateFromMaxDate, dateToMinDate, dateToMaxDate } = state

  const { t } = useTranslations()

  const fieldDateFromValidation = useFieldDateFromValidation({ dateFromMaxDate, dateFromMinDate })
  const fieldDateToValidation = useFieldDateToValidation({ dateToMaxDate, dateToMinDate })
  const fieldBlockchainHashValidation = useFieldBlockchainHashValidation()

  return Yup.object().shape(
    {
      dateFrom: fieldDateFromValidation.required(t({ id: 'dateIsRequired' })),
      dateTo: fieldDateToValidation.required(t({ id: 'dateIsRequired' })),
      currency: Yup.string().nullable().optional(),
      minAmount: Yup.string()
        .nullable()
        .optional()
        .test('minAmount', t({ id: 'invalidAmount' }), function (value) {
          const { maxAmount } = this.parent

          const hasValidMaxAmount = maxAmount && !isNaN(parseFloat(formatToFloatReadyFormat(maxAmount)))
          const hasValidMinAmount = value && !isNaN(parseFloat(formatToFloatReadyFormat(value)))

          if (hasValidMaxAmount && hasValidMinAmount) {
            return parseFloat(formatToFloatReadyFormat(value)) <= parseFloat(formatToFloatReadyFormat(maxAmount))
          }

          return true
        }),
      maxAmount: Yup.string()
        .nullable()
        .optional()
        .test('maxAmount', t({ id: 'invalidAmount' }), function (value) {
          const { minAmount } = this.parent

          const hasValidMaxAmount = value && !isNaN(parseFloat(formatToFloatReadyFormat(value)))
          const hasValidMinAmount = minAmount && !isNaN(parseFloat(formatToFloatReadyFormat(minAmount)))

          if (hasValidMaxAmount && hasValidMinAmount) {
            return parseFloat(formatToFloatReadyFormat(minAmount)) <= parseFloat(formatToFloatReadyFormat(value))
          }

          return true
        }),
      blockchainHash: fieldBlockchainHashValidation
    },
    [['dateFrom', 'dateTo']]
  )
}
