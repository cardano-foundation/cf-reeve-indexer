import { FormikHelpers } from 'formik'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useDatesRange } from 'hooks'
import { OrganisationsApiResponse } from 'libs/api-connectors/backend-connector-lob/api/organisation/organisationApi.types.ts'
import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation'
import { useFormExtractionValidation } from 'libs/form-kit/validations/useFormExtractionValidation.ts'
import { ExtractionFormValues } from 'modules/extraction/components/ExtractionForm/ExtractionForm.types.ts'
import { PATHS } from 'routes'

interface ExtractionFormState {
  organisations: OrganisationsApiResponse | null
  locationState: ExtractionFormValues | null
}

export const useExtractionForm = (state: ExtractionFormState) => {
  const { organisations, locationState } = state

  const navigate = useNavigate()

  const selectedOrganisation = useSelectedOrganisation()

  const [initialValues, setInitialValues] = useState<ExtractionFormValues>({
    organisation: locationState?.organisation ?? selectedOrganisation,
    dateFrom: locationState?.dateFrom ?? null,
    dateTo: locationState?.dateTo ?? null,
    costCenter: locationState?.costCenter ?? [],
    project: locationState?.project ?? [],
    accountType: locationState?.accountType ?? [],
    accountSubtype: locationState?.accountSubtype ?? [],
    accountCode: locationState?.accountCode ?? []
  })

  const organisation = organisations?.find((item) => item.id === selectedOrganisation)

  const { dateFromMinDate, dateFromMaxDate, dateToMinDate, dateToMaxDate } = useDatesRange({
    predefinedDateFrom: organisation?.accountPeriodFrom,
    predefinedDateTo: organisation?.accountPeriodTo
  })

  const validationSchema = useFormExtractionValidation({ dateFromMaxDate, dateFromMinDate, dateToMaxDate, dateToMinDate })

  const handleFormReset = (_values: ExtractionFormValues, formikHelpers: FormikHelpers<ExtractionFormValues>) => {
    const INITIAL_FORM_VALUES: ExtractionFormValues = {
      organisation: selectedOrganisation,
      dateFrom: null,
      dateTo: null,
      costCenter: [],
      project: [],
      accountType: [],
      accountSubtype: [],
      accountCode: []
    }

    setInitialValues(INITIAL_FORM_VALUES)
    formikHelpers.validateForm(INITIAL_FORM_VALUES)
  }

  const handleFormSubmit = async (values: ExtractionFormValues) => {
    navigate(PATHS.DATA_EXPLORER_EXTRACTION_RESULTS, { state: { ...values } })
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
