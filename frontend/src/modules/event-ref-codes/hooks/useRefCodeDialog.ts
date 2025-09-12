import { useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { FormikHelpers } from 'formik'
import { useEffect } from 'react'

import { PostRefCodeRequest } from 'libs/api-connectors/backend-connector-lob/api/ref-codes/refCodesApi.types.ts'
import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation.tsx'
import { useCreateRefCodeModel } from 'libs/models/ref-codes/CreateRefCode.service.ts'
import { useUpdateRefCodeModel } from 'libs/models/ref-codes/UpdateRefCode.service.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { useDialogAlert } from 'libs/ui-kit/components/DialogAlert/useDialogAlert.ts'
import { SnackbarType } from 'libs/ui-kit/components/Snackbar/Snackbar.component.tsx'
import { RefCodeFormValues } from 'modules/event-ref-codes/components/RefCodeDetailsForm/RefCodeDetailsForm.types.ts'

interface RefCodeDialogHandlers {
  onRefCodeSelectionReset: () => void
  onSnackbarOpen: (message: string, type: SnackbarType, hint?: string) => void
}

export const useRefCodeDialog = (handlers: RefCodeDialogHandlers) => {
  const { onRefCodeSelectionReset, onSnackbarOpen } = handlers

  const queryClient = useQueryClient()

  const { t } = useTranslations()

  const selectedOrganisation = useSelectedOrganisation()

  const { handleDialogClose, handleDialogOpen, isOpen } = useDialogAlert()

  const { triggerCreateRefCode } = useCreateRefCodeModel()
  const { triggerUpdateRefCode } = useUpdateRefCodeModel()

  const handleDialogConfirm = async (values: RefCodeFormValues, formikHelpers: FormikHelpers<RefCodeFormValues>, isEditMode: boolean) => {
    const payload: PostRefCodeRequest = {
      organisationId: selectedOrganisation,
      name: values.description,
      referenceCode: values.referenceCode,
      parentReferenceCode: values.hasParent ? values.parentReferenceCode : '',
      active: values.active
    }

    const createOrUpdateRefCode = isEditMode ? triggerUpdateRefCode : triggerCreateRefCode

    await createOrUpdateRefCode(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['REF_CODES'] })
        onSnackbarOpen(isEditMode ? t({ id: 'refCodeUpdateSuccess' }) : t({ id: 'refCodeCreateSuccess' }), SnackbarType.SUCCESS)
      },
      onError: (error) => {
        if (isAxiosError(error) && error.response && error.response.status >= 400) {
          onSnackbarOpen(isEditMode ? t({ id: 'refCodeUpdateError' }) : t({ id: 'refCodeUpdateError' }), SnackbarType.ERROR, error.response?.data.error.detail)

          if (error.response?.data.error.title === 'REFERENCE_CODE_ALREADY_EXIST') {
            formikHelpers.setFieldError('referenceCode', error.response?.data.error.detail)
          }
        }
      }
    })
  }

  useEffect(() => {
    if (!isOpen) {
      onRefCodeSelectionReset()
    }
  }, [onRefCodeSelectionReset, isOpen])

  return {
    handleRefCodeDialogClose: handleDialogClose,
    handleRefCodeDialogConfirm: handleDialogConfirm,
    handleRefCodeDialogOpen: handleDialogOpen,
    isRefCodeDialogOpen: isOpen
  }
}
