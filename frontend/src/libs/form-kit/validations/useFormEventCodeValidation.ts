import * as Yup from 'yup'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'

export const useFormEventCodeValidation = (isEditMode: boolean, existingCodes: string[]) => {
  const { t } = useTranslations()

  let eventCodeSchema = Yup.string().optional()

  if (!isEditMode) {
    eventCodeSchema = eventCodeSchema.notOneOf(existingCodes, t({ id: 'eventCodeAlreadyExists' }))
  }

  return Yup.object({
    description: Yup.string().required(t({ id: 'descriptionIsRequired' })),
    debitReferenceCode: Yup.string()
      .matches(/^[a-zA-Z0-9]{4}$/, t({ id: 'debitReferenceCodeMustBeFourDigits' }))
      .required(t({ id: 'debitReferenceCodeIsRequired' })),
    creditReferenceCode: Yup.string()
      .matches(/^[a-zA-Z0-9]{4}$/, t({ id: 'creditReferenceCodeMustBeFourDigits' }))
      .required(t({ id: 'creditReferenceCodeIsRequired' })),
    eventCode: eventCodeSchema
  })
}
