import * as Yup from 'yup'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'

export const useFieldBlockchainHashValidation = () => {
  const { t } = useTranslations()

  return Yup.string()
    .nullable()
    .optional()
    .matches(/^([a-zA-Z0-9]{64})([ ,]([a-zA-Z0-9]{64}))*$/g, t({ id: 'specialCharactersNotAllowed' }))
}
