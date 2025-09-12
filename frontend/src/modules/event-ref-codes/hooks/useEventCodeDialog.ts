import { useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { FormikHelpers } from 'formik'
import { useEffect } from 'react'

import { PostEventCodeRequest } from 'libs/api-connectors/backend-connector-lob/api/event-codes/eventCodesApi.types.ts'
import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation.tsx'
import { useCreateEventCodeModel } from 'libs/models/event-codes/CreateEventCode.service.ts'
import { useUpdateEventCodeModel } from 'libs/models/event-codes/UpdateEventCode.service.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { useDialogAlert } from 'libs/ui-kit/components/DialogAlert/useDialogAlert.ts'
import { SnackbarType } from 'libs/ui-kit/components/Snackbar/Snackbar.component.tsx'
import { EventCodeFormValues } from 'modules/event-ref-codes/components/EventCodeDetailsForm/EventCodeDetailsForm.types.ts'

interface EventCodeDialogHandlers {
  onEventCodeSelectionReset: () => void
  onSnackbarOpen: (message: string, type: SnackbarType, hint?: string) => void
}

export const useEventCodeDialog = (handlers: EventCodeDialogHandlers) => {
  const { onEventCodeSelectionReset, onSnackbarOpen } = handlers

  const queryClient = useQueryClient()

  const { t } = useTranslations()

  const selectedOrganisation = useSelectedOrganisation()

  const { handleDialogClose, handleDialogOpen, isOpen } = useDialogAlert()

  const { triggerCreateEventCode } = useCreateEventCodeModel()
  const { triggerUpdateEventCode } = useUpdateEventCodeModel()

  const handleDialogConfirm = async (values: EventCodeFormValues, formikHelpers: FormikHelpers<EventCodeFormValues>, isEditMode: boolean) => {
    const payload: PostEventCodeRequest = {
      organisationId: selectedOrganisation,
      name: values.description,
      creditReferenceCode: values.creditReferenceCode,
      debitReferenceCode: values.debitReferenceCode
    }

    const createOrUpdateEventCode = isEditMode ? triggerUpdateEventCode : triggerCreateEventCode

    await createOrUpdateEventCode(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['EVENT_CODES'] })
        onSnackbarOpen(isEditMode ? t({ id: 'eventCodeUpdateSuccess' }) : t({ id: 'eventCodeCreateSuccess' }), SnackbarType.SUCCESS)
      },
      onError: (error) => {
        if (isAxiosError(error) && error.response && error.response.status >= 400) {
          onSnackbarOpen(isEditMode ? t({ id: 'eventCodeUpdateError' }) : t({ id: 'eventCodeUpdateError' }), SnackbarType.ERROR, error.response?.data.error.detail)

          if (error.response?.data.error.title === 'ACCOUNT_EVENT_ALREADY_EXISTS') {
            formikHelpers.setFieldError('eventCode', error.response?.data.error.detail)
          }
        }
      }
    })
  }

  useEffect(() => {
    if (!isOpen) {
      onEventCodeSelectionReset()
    }
  }, [onEventCodeSelectionReset, isOpen])

  return {
    handleEventCodeDialogClose: handleDialogClose,
    handleEventCodeDialogConfirm: handleDialogConfirm,
    handleEventCodeDialogOpen: handleDialogOpen,
    isEventCodeDialogOpen: isOpen
  }
}
