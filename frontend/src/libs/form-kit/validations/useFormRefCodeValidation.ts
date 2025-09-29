import * as Yup from 'yup'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'

export const useFormRefCodeValidation = (isEditMode: boolean, existingCodes: string[]) => {
  const { t } = useTranslations()

  let referenceCodeSchema = Yup.string()
    .required(t({ id: 'refCodeIsRequired' }))
    .matches(/^[A-Za-z0-9]{4}$/, t({ id: 'refCodeMustBe4Alphanumeric' }))

  if (!isEditMode) {
    referenceCodeSchema = referenceCodeSchema.notOneOf(existingCodes, t({ id: 'refCodeAlreadyExists' }))
  }

  return Yup.object({
    referenceCode: referenceCodeSchema,
    description: Yup.string().required(t({ id: 'descriptionIsRequired' })),
    parentReferenceCode: Yup.string().when('hasParent', {
      is: true,
      then: (schema) => schema.required(t({ id: 'refCodeIsRequired' })).matches(/^[A-Za-z0-9]{4}$/, t({ id: 'refCodeMustBe4Alphanumeric' })),
      otherwise: (schema) => schema.notRequired().nullable()
    }),
    active: Yup.boolean().optional()
  })
}
