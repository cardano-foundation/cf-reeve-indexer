import * as Yup from 'yup'

import { usernameRegex } from 'libs/form-kit/const/regexUsername.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'

import { regexEmail } from '../const/regexEmail'

export const useFieldUsernameOrEmailValidation = () => {
  const { t } = useTranslations()

  return Yup.string().test('usernameOrEmail', t({ id: 'invalidUsernameOrEmail' }), (value) => {
    if (!value) return false

    return regexEmail.test(value) || usernameRegex.test(value)
  })
}
