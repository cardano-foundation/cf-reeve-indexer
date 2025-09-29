import * as Yup from 'yup'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'

import { useFieldEmailValidation } from './useFieldEmailValidation'

export const useFormOrganisationManagerUpdateValidation = () => {
  const { t } = useTranslations()

  const emailValidation = useFieldEmailValidation()

  return Yup.object({
    name: Yup.string().required(t({ id: 'nameIsRequired' })),
    adminEmail: emailValidation.optional(),
    phoneNumber: Yup.string().optional(),
    websiteUrl: Yup.string()
      .url(t({ id: 'invalidWebisteUrl' }))
      .optional(),

    city: Yup.string().optional(),
    postCode: Yup.string().optional(),
    province: Yup.string().optional(),
    countryCode: Yup.string().required()
  })
}
