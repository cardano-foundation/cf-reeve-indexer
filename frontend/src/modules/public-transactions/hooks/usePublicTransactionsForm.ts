import { FormikHelpers } from 'formik'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useDatesRange } from 'hooks'
import { OrganisationsApiResponse } from 'libs/api-connectors/backend-connector-lob/api/organisation/organisationApi.types.ts'
import { useFormPublicTransactionsValidation } from 'libs/form-kit/validations/useFormPublicTransactionsValidation.ts'
import { toDayjs } from 'libs/utils/toDayjs.ts'
import { PublicTransactionsFormValues } from 'modules/public-transactions/components/PublicTransactionsForm/PublicTransactionsForm.types.ts'
import { PATHS } from 'routes'

interface TransactionsFormState {
  organisations: OrganisationsApiResponse | null
  locationState: PublicTransactionsFormValues | null
}

export const usePublicTransactionsForm = (state: TransactionsFormState) => {
  const { organisations, locationState } = state

  const navigate = useNavigate()

  const selectedOrganisation = '75f95560c1d883ee7628993da5adf725a5d97a13929fd4f477be0faf5020ca94'

  const [initialValues, setInitialValues] = useState<PublicTransactionsFormValues>({
    organisation: locationState?.organisation ?? selectedOrganisation,
    dateFrom: locationState?.dateFrom ? toDayjs(locationState.dateFrom) : undefined,
    dateTo: locationState?.dateTo ? toDayjs(locationState.dateTo) : undefined,
    currency: locationState?.currency ?? '',
    minAmount: locationState?.minAmount ?? '',
    maxAmount: locationState?.maxAmount ?? '',
    blockchainHash: locationState?.blockchainHash ?? ''
  })

  const organisation = organisations?.find((item) => item.id === selectedOrganisation)

  const { dateFromMinDate, dateFromMaxDate, dateToMinDate, dateToMaxDate } = useDatesRange({
    predefinedDateFrom: organisation?.accountPeriodFrom,
    predefinedDateTo: organisation?.accountPeriodTo
  })

  const validationSchema = useFormPublicTransactionsValidation({ dateFromMaxDate, dateFromMinDate, dateToMaxDate, dateToMinDate })

  const handleFormReset = (_values: PublicTransactionsFormValues, formikHelpers: FormikHelpers<PublicTransactionsFormValues>) => {
    const INITIAL_FORM_VALUES: PublicTransactionsFormValues = {
      organisation: selectedOrganisation,
      dateFrom: undefined,
      dateTo: undefined,
      currency: '',
      minAmount: '',
      maxAmount: '',
      blockchainHash: ''
    }

    setInitialValues(INITIAL_FORM_VALUES)
    formikHelpers.validateForm(INITIAL_FORM_VALUES)
  }

  const handleFormSubmit = async (values: PublicTransactionsFormValues) => {
    navigate(PATHS.PUBLIC_TRANSACTIONS_RESULTS, { state: { ...values } })
  }

  return {
    dateFromMinDate,
    dateFromMaxDate,
    dateToMinDate,
    dateToMaxDate,
    initialValues,
    validationSchema,
    handleFormReset,
    handleFormSubmit
  }
}
