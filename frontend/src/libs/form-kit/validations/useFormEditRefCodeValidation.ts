import * as Yup from 'yup'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'

export const useFormEditRefCodeValidation = () => {
  const { t } = useTranslations()

  return Yup.object({
    description: Yup.string().required(t({ id: 'descriptionIsRequired' })),
    parentReferenceCode: Yup.string().when('hasParent', {
      is: true,
      then: (schema) => schema.required(t({ id: 'refCodeIsRequired' })).matches(/^[A-Za-z0-9]{4}$/, t({ id: 'refCodeMustBe4Alphanumeric' })),
      otherwise: (schema) => schema.notRequired().nullable()
    }),
    active: Yup.boolean().optional()
  })
}
