import { FormikHelpers } from 'formik'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useDatesRange } from 'hooks'
import { OrganisationsApiResponse } from 'libs/api-connectors/backend-connector-reeve/api/organisation/organisationApi.types.ts'
import { useFormPublicTransactionsValidation } from 'libs/form-kit/validations/useFormPublicTransactionsValidation.ts'
import { toDayjs } from 'libs/utils/toDayjs.ts'
import { PublicTransactionsFormValues } from 'modules/public-transactions/components/PublicTransactionsForm/PublicTransactionsForm.types.ts'
import { PATHS } from 'routes'
import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext'

interface TransactionsFormState {
  organisations: OrganisationsApiResponse | null
  locationState: PublicTransactionsFormValues | null
}

export const usePublicTransactionsForm = (state: TransactionsFormState) => {
  const { organisations, locationState } = state

  const navigate = useNavigate()
  const { selectedOrganisation } = useLayoutPublicContext()

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
