import { FormikHelpers } from 'formik'

import { EventCodeResponse } from 'libs/api-connectors/backend-connector-lob/api/event-codes/eventCodesApi.types.ts'
import { EventCodeFormValues } from 'modules/event-ref-codes/components/EventCodeDetailsForm/EventCodeDetailsForm.types.ts'
import { useEventCodeForm } from 'modules/event-ref-codes/hooks/useEventCodeForm.ts'
import { useEventCodesQueries } from 'modules/event-ref-codes/hooks/useEventCodesQueries.ts'
import { useRefCodesQueries } from 'modules/event-ref-codes/hooks/useRefCodesQueries.ts'

interface useDialogEventCodesState {
  eventCode?: EventCodeResponse
}

interface useDialogEventCodesHandlers {
  onCancel: () => void
  onConfirm: (values: EventCodeFormValues, formikHelpers: FormikHelpers<EventCodeFormValues>, isEditMode: boolean) => Promise<void>
}

export const useDialogEventCodes = (state: useDialogEventCodesState, handlers: useDialogEventCodesHandlers) => {
  const { eventCode } = state
  const { onCancel, onConfirm } = handlers

  const { eventCodes, isFetching: isFetchingEventCodes } = useEventCodesQueries()
  const { refCodes, isFetching: isFetchingRefCodes } = useRefCodesQueries()

  const isEditMode = Boolean(eventCode?.customerCode)

  const { initialValues, handleFormSubmit } = useEventCodeForm({ eventCode }, { onCancel, onConfirm }, isEditMode)

  const refCodeOptions = refCodes.map((event) => ({
    value: event.referenceCode,
    name: `${event.referenceCode} - ${event.description}`
  }))

  const isFetching = isFetchingRefCodes || isFetchingEventCodes

  return {
    initialValues,
    eventCodes,
    refCodeOptions,
    handleFormSubmit,
    isEditMode,
    isFetching
  }
}
