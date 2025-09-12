import * as Yup from 'yup'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'

export const useFormVatCodeValidation = (isEditMode: boolean, existingCodes: string[]) => {
  const { t } = useTranslations()

  let codesSchema = Yup.string().required(t({ id: 'codeIsRequired' }))

  if (!isEditMode) {
    codesSchema = codesSchema.notOneOf(existingCodes, t({ id: 'codeAlreadyExists' }))
  }

  return Yup.object({
    code: codesSchema,
    description: Yup.string().required(t({ id: 'descriptionIsRequired' })),
    countryCode: Yup.string().optional(),
    rate: Yup.string().required(t({ id: 'rateIsRequired' })),
    active: Yup.boolean().optional()
  })
}
