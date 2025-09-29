import * as Yup from 'yup'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'

export const useFormCostCenterValidation = (isEditMode: boolean, existingCodes: string[]) => {
  const { t } = useTranslations()

  let codesSchema = Yup.string().required(t({ id: 'codeIsRequired' }))

  if (!isEditMode) {
    codesSchema = codesSchema.notOneOf(existingCodes, t({ id: 'codeAlreadyExists' }))
  }

  return Yup.object({
    code: codesSchema,
    description: Yup.string().required(t({ id: 'descriptionIsRequired' })),
    hasParent: Yup.boolean().optional(),
    parentCode: Yup.string().when('hasParent', {
      is: true,
      then: (schema) => schema.required(t({ id: 'parentCodeIsRequired' })),
      otherwise: (schema) => schema.notRequired().nullable()
    }),
    active: Yup.boolean().optional()
  })
}
