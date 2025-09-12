import { Dayjs } from 'dayjs'
import * as Yup from 'yup'

import { CSV_FILE_TYPE, DEFAULT_FILE_SIZE } from 'libs/const/files.ts'
import { useFieldDateFromValidation } from 'libs/form-kit/validations/useFieldDateFromValidation.ts'
import { useFieldDateToValidation } from 'libs/form-kit/validations/useFieldDateToValidation.ts'
import { useFieldTransactionNumbersValidation } from 'libs/form-kit/validations/useFieldTransactionNumbersValidation.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ImportType } from 'modules/import/components/ImportForm/ImportForm.types.ts'

interface FormImportValidationState {
  dateFromMinDate: Dayjs
  dateFromMaxDate: Dayjs
  dateToMinDate: Dayjs
  dateToMaxDate: Dayjs
}

export const useFormImportValidation = (state: FormImportValidationState) => {
  const { dateFromMinDate, dateFromMaxDate, dateToMinDate, dateToMaxDate } = state

  const { t } = useTranslations()

  const fieldDateFromValidation = useFieldDateFromValidation({ dateFromMaxDate, dateFromMinDate })
  const fieldDateToValidation = useFieldDateToValidation({ dateToMaxDate, dateToMinDate })
  const fieldTransactionNumbersValidation = useFieldTransactionNumbersValidation()

  return Yup.object().shape(
    {
      organisation: Yup.string().required('organisationIsRequired'),
      dataSource: Yup.string().when('importType', {
        is: ImportType.ERP,
        then: (schema) => schema.required('dataSourceIsRequired'),
        otherwise: (schema) => schema.nullable().optional()
      }),
      dateFrom: fieldDateFromValidation.when('importType', {
        is: ImportType.ERP,
        then: (schema) => schema.required(t({ id: 'dateIsRequired' })),
        otherwise: (schema) => schema.nullable().optional()
      }),
      dateTo: fieldDateToValidation.when('importType', {
        is: ImportType.ERP,
        then: (schema) => schema.required(t({ id: 'dateIsRequired' })),
        otherwise: (schema) => schema.nullable().optional()
      }),
      transactionNumbers: fieldTransactionNumbersValidation.nullable().optional(),
      transactionTypes: Yup.array().of(Yup.string()).optional(),
      file: Yup.mixed()
        .when('importType', {
          is: ImportType.ERP,
          then: (schema) => schema.nullable().optional(),
          otherwise: (schema) => schema.required(t({ id: 'fileIsRequired' }))
        })
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
        }),
      importType: Yup.string()
        .oneOf(Object.values(ImportType), t({ id: 'invalidImportType' }))
        .required(t({ id: 'importTypeIsRequired' }))
    },
    [['dateFrom', 'dateTo']]
  )
}
