import * as Yup from 'yup'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'

export const useFieldPasswordValidation = () => {
  const { t } = useTranslations()

  return Yup.string()
    .matches(/[A-Z]/, t({ id: 'invalidPasswordNew' }))
    .matches(/[a-z]/, t({ id: 'invalidPasswordNew' }))
    .matches(/[0-9]/, t({ id: 'invalidPasswordNew' }))
    .matches(/[@$!%*?&#]/, t({ id: 'invalidPasswordNew' }))
    .min(8, t({ id: 'invalidPasswordNew' }))
}
