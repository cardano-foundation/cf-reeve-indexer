import * as Yup from 'yup'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'

export const useFieldTransactionNumbersValidation = () => {
  const { t } = useTranslations()

  return Yup.string()
    .nullable()
    .optional()
    .matches(/^([a-zA-Z0-9-/]+)([ ,]([a-zA-Z0-9-/]+))*$/g, t({ id: 'transactionNumbersSpecialCharactersNotAllowed' }))
}
