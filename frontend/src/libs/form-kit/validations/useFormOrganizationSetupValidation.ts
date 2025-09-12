import * as Yup from 'yup'

import { CSV_FILE_TYPE, DEFAULT_FILE_SIZE } from 'libs/const/files.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { SetupType } from 'modules/organization-setup/components/OrganizationSetupForm/OrganizationSetupForm.types.ts'

export const useFormOrganizationSetupValidation = () => {
  const { t } = useTranslations()

  return Yup.object().shape({
    setupType: Yup.string()
      .oneOf(Object.values(SetupType), t({ id: 'invalidOrganizationSetupType' }))
      .required(t({ id: 'organizationSetupTypeIsRequired' })),
    file: Yup.mixed()
      .test({
        message: t({ id: 'incorrectFileType' }),
        test: (file) => {
          if (!file) return true

          return file instanceof File && [CSV_FILE_TYPE].includes(file.type)
        }
      })
      .test({
        message: t({ id: 'incorrectFileSize' }),
        test: (file) => {
          if (!file) return true

          return file instanceof File && file.size <= DEFAULT_FILE_SIZE
        }
      })
  })
}
