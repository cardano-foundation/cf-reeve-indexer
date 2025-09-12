import { isAxiosError } from 'axios'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useDatesRange } from 'hooks'
import { OrganisationsApiResponse } from 'libs/api-connectors/backend-connector-lob/api/organisation/organisationApi.types.ts'
import {
  ApiError,
  ExtractorType,
  ExtractTransactionsApiRequest,
  UploadTransactionsApiError,
  UploadTransactionsApiRequest
} from 'libs/api-connectors/backend-connector-lob/api/transactions/transactionsApi.types.ts'
import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation.tsx'
import { PRESELECTED_DATA_SOURCE } from 'libs/const/organisation.ts'
import { useFormImportValidation } from 'libs/form-kit/validations/useFormImportValidation.ts'
import { useExtractTransactionsModel } from 'libs/models/transactions-model/ExtractTransactions/ExtractTransactions.service.ts'
import { TransactionsTypesDTO } from 'libs/models/transactions-model/GetTransactionsTypes/GetTransactionTypes.types.ts'
import { useUploadTransactionsModel } from 'libs/models/transactions-model/UploadTransactions/UploadTransactionsModel.service.ts'
import { useValidateUploadTransactionsModel } from 'libs/models/transactions-model/ValidateUploadTransaction/ValidateUploadTransactionModel.service.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { SnackbarType } from 'libs/ui-kit/components/Snackbar/Snackbar.component.tsx'
import { ImportFormValues, ImportType } from 'modules/import/components/ImportForm/ImportForm.types.ts'
import { useImportSnackbar } from 'modules/import/hooks/useImportSnackbar.ts'
import { PATHS } from 'routes'

export type ErrorDetail = Pick<ApiError, 'detail' | 'status' | 'title'>

interface ImportFormState {
  organisations: OrganisationsApiResponse | null
  transactionTypes: TransactionsTypesDTO | null
}

interface ImportFormHandlers {
  onSnackbarOpen: ReturnType<typeof useImportSnackbar>['handleSnackbarOpen']
}

export const useImportForm = (state: ImportFormState, handlers: ImportFormHandlers) => {
  const { organisations, transactionTypes } = state
  const { onSnackbarOpen } = handlers

  const [apiErrors, setApiErrors] = useState<ErrorDetail[] | null>(null)

  const { t } = useTranslations()

  const navigate = useNavigate()

  const selectedOrganisation = useSelectedOrganisation()

  const { triggerValidateUploadTransactions } = useValidateUploadTransactionsModel()
  const { triggerImportTransactions } = useExtractTransactionsModel()
  const { triggerUploadTransactions } = useUploadTransactionsModel()

  const organisation = organisations?.find((item) => item.id === selectedOrganisation)

  const { dateFromMinDate, dateFromMaxDate, dateToMinDate, dateToMaxDate } = useDatesRange({
    predefinedDateFrom: organisation?.accountPeriodFrom,
    predefinedDateTo: organisation?.accountPeriodTo
  })

  const validationSchema = useFormImportValidation({ dateFromMaxDate, dateFromMinDate, dateToMaxDate, dateToMinDate })

  const initialValues: ImportFormValues = {
    organisation: selectedOrganisation,
    importType: ImportType.ERP,
    dataSource: PRESELECTED_DATA_SOURCE,
    dateFrom: null,
    dateTo: null,
    transactionTypes: [],
    transactionNumbers: '',
    file: null
  }

  const handleImportFormSubmit = async (values: ImportFormValues) => {
    const transactionNumbers = values.transactionNumbers.split(/,| /).filter((hash) => hash && hash.trim())

    const transactionTypesAllApiRequest = transactionTypes ? transactionTypes.map((item) => item.value) : []
    const transactionTypesApiRequest = values.transactionTypes.length > 0 ? values.transactionTypes : transactionTypesAllApiRequest

    const payload: ExtractTransactionsApiRequest = {
      organisationId: values.organisation,
      extractorType: ExtractorType.NETSUITE,
      dateFrom: dayjs(values.dateFrom).format('YYYY-MM-DD'),
      dateTo: dayjs(values.dateTo).format('YYYY-MM-DD'),
      transactionType: transactionTypesApiRequest,
      transactionNumbers
    }

    await triggerImportTransactions(payload, {
      onSuccess: () => {
        navigate(PATHS.TRANSACTIONS, { state: { hasImportedTransactions: true } })
      },
      onError: (error) => {
        if (isAxiosError(error)) {
          if (error.response?.status === 400) {
            onSnackbarOpen(t({ id: 'unableToImportMessage' }), SnackbarType.ERROR, error.response?.data.detail)
          }
        }
      }
    })
  }

  const handleUploadFormSubmit = async (values: ImportFormValues) => {
    if (!values.file) return

    const formData = new FormData()

    const payload: UploadTransactionsApiRequest = {
      organisationId: values.organisation,
      extractorType: ExtractorType.CSV,
      // TODO: both dateFrom and dateTo are required, but they shouldn't be
      // required for upload transactions
      dateFrom: organisation?.accountPeriodFrom ?? dayjs(values.dateFrom).format('YYYY-MM-DD'),
      dateTo: organisation?.accountPeriodTo ?? dayjs(values.dateTo).format('YYYY-MM-DD'),
      file: values.file
    }

    Object.entries(payload).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value)
      }
    })

    setApiErrors(null)

    onSnackbarOpen(t({ id: 'importInProgressMessage' }), SnackbarType.LOADING, t({ id: 'loadingHint' }))

    await triggerValidateUploadTransactions(formData as unknown as UploadTransactionsApiRequest, {
      onError: (error) => {
        if (isAxiosError<UploadTransactionsApiError>(error)) {
          if (error.status && error.status === 400) {
            setApiErrors(error.response?.data.errors ? (Array.isArray(error.response?.data.errors) ? error.response?.data.errors : [error.response?.data.errors]) : null)
          }
        }
      }
    })

    await triggerUploadTransactions(formData as unknown as UploadTransactionsApiRequest, {
      onSuccess: () => {
        navigate(PATHS.TRANSACTIONS, { state: { hasImportedTransactions: true } })
      }
    })
  }

  const handleFormSubmit = async (values: ImportFormValues) => {
    values.importType === ImportType.ERP ? await handleImportFormSubmit(values) : await handleUploadFormSubmit(values)
  }

  return {
    apiErrors,
    dateFromMinDate,
    dateFromMaxDate,
    dateToMinDate,
    dateToMaxDate,
    initialValues,
    validationSchema,
    handleFormSubmit
  }
}
