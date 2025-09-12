import { useDatesRange } from 'hooks'
import { OrganisationsApiResponse } from 'libs/api-connectors/backend-connector-lob/api/organisation/organisationApi.types.ts'
import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation'
import { PRESELECTED_DATA_SOURCE } from 'libs/const/organisation.ts'
import { useFormReconciliationValidation } from 'libs/form-kit/validations/useFormReconciliationValidation.ts'
import { ReconciliationFormValues } from 'modules/reconciliation/components/ReconciliationForm/ReconciliationForm.types.ts'

interface ReconciliationDialogFormState {
  organisations: OrganisationsApiResponse | null
}

interface ReconciliationDialogFormHandlers {
  onCancel: () => void
  onConfirm: (values: ReconciliationFormValues) => Promise<void>
}

export const useReconciliationDialogForm = (state: ReconciliationDialogFormState, handlers: ReconciliationDialogFormHandlers) => {
  const { organisations } = state
  const { onCancel, onConfirm } = handlers
  const selectedOrganisation = useSelectedOrganisation()

  const organisation = organisations?.find((item) => item.id === selectedOrganisation)

  const { dateFromMinDate, dateFromMaxDate, dateToMinDate, dateToMaxDate } = useDatesRange({
    predefinedDateFrom: organisation?.accountPeriodFrom,
    predefinedDateTo: organisation?.accountPeriodTo
  })

  const validationSchema = useFormReconciliationValidation({ dateFromMaxDate, dateFromMinDate, dateToMaxDate, dateToMinDate })

  const initialValues: ReconciliationFormValues = {
    organisation: selectedOrganisation,
    dataSource: PRESELECTED_DATA_SOURCE,
    dateFrom: null,
    dateTo: null
  }

  const handleFormSubmit = async (values: ReconciliationFormValues) => {
    await onConfirm(values)
    onCancel()
  }

  return {
    dateFromMinDate,
    dateFromMaxDate,
    dateToMinDate,
    dateToMaxDate,
    initialValues,
    validationSchema,
    handleFormSubmit
  }
}
