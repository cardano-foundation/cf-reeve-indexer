import * as Yup from 'yup'

import { useFieldPasswordValidation } from 'libs/form-kit/validations/useFieldPasswordValidation.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'

export const useFormPasswordNewRequestValidation = () => {
  const { t } = useTranslations()

  const fieldPasswordValidation = useFieldPasswordValidation()

  return Yup.object({
    passwordNew: fieldPasswordValidation,
    passwordConfirm: fieldPasswordValidation.oneOf([Yup.ref('passwordNew')], t({ id: 'passwordsDoNotMatch' }))
  })
}
