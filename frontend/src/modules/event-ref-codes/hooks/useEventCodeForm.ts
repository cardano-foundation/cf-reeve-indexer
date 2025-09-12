import { FormikHelpers } from 'formik'

import { EventCodeResponse } from 'libs/api-connectors/backend-connector-lob/api/event-codes/eventCodesApi.types.ts'
import { EventCodeFormValues } from 'modules/event-ref-codes/components/EventCodeDetailsForm/EventCodeDetailsForm.types.ts'

interface EventCodeFormHandlers {
  onCancel: () => void
  onConfirm: (values: EventCodeFormValues, formikHelpers: FormikHelpers<EventCodeFormValues>, isEditMode: boolean) => Promise<void>
}

interface EventCodeFormState {
  eventCode?: EventCodeResponse
}

export const useEventCodeForm = (state: EventCodeFormState, handlers: EventCodeFormHandlers, isEditMode: boolean) => {
  const { eventCode } = state
  const { onCancel, onConfirm } = handlers

  const initialValues: EventCodeFormValues = {
    customerCode: eventCode?.customerCode ?? '',
    description: eventCode?.description ?? '',
    creditReferenceCode: eventCode?.creditReferenceCode ?? '',
    debitReferenceCode: eventCode?.debitReferenceCode ?? '',
    eventCode: `${eventCode?.debitReferenceCode ?? ''}${eventCode?.creditReferenceCode ?? ''}`
  }

  const handleFormSubmit = async (values: EventCodeFormValues, formikHelpers: FormikHelpers<EventCodeFormValues>) => {
    await onConfirm(values, formikHelpers, isEditMode)
    onCancel()
  }

  return { initialValues, handleFormSubmit }
}
