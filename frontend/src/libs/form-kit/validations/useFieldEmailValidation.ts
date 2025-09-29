import * as Yup from 'yup'

import { regexEmail } from 'libs/form-kit/const/regexEmail.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'

export const useFieldEmailValidation = () => {
  const { t } = useTranslations()

  return Yup.string()
    .email(t({ id: 'invalidEmail' }))
    .matches(regexEmail, t({ id: 'invalidEmail' }))
}
