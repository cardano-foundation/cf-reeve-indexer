import { useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { FormikHelpers } from 'formik'
import { useEffect } from 'react'

import { VatCodeRequestParameters } from 'libs/api-connectors/backend-connector-lob/api/vat-codes/vatCodesApi.types.ts'
import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation.tsx'
import { useCreateVatCodeModel } from 'libs/models/vat-codes/CreateVatCodeModel.service.ts'
import { useUpdateVatCodeModel } from 'libs/models/vat-codes/UpdateVatCodeModel.service.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { useDialogAlert } from 'libs/ui-kit/components/DialogAlert/useDialogAlert.ts'
import { SnackbarType } from 'libs/ui-kit/components/Snackbar/Snackbar.component.tsx'
import { VatCodeFormValues } from 'modules/vat-codes/components/VatCodeForm/VatCodeForm.types.ts'

interface VatCodeDialogHandlers {
  onSnackbarOpen: (message: string, type: SnackbarType, hint?: string) => void
  onVatCodeSelectionReset: () => void
}

export const useVatCodeDialog = (handlers: VatCodeDialogHandlers) => {
  const { onSnackbarOpen, onVatCodeSelectionReset } = handlers

  const queryClient = useQueryClient()

  const { t } = useTranslations()

  const selectedOrganisation = useSelectedOrganisation()

  const { handleDialogClose, handleDialogOpen, isOpen } = useDialogAlert()

  const { triggerCreateVatCode } = useCreateVatCodeModel()
  const { triggerUpdateVatCode } = useUpdateVatCodeModel()

  const handleDialogConfirm = async (values: VatCodeFormValues, formikHelpers: FormikHelpers<VatCodeFormValues>, isEditMode: boolean) => {
    const payload: VatCodeRequestParameters = {
      organisationId: selectedOrganisation,
      countryCode: values.countryCode || undefined,
      customerCode: values.code,
      description: values.description,
      rate: values.rate ? parseFloat((parseFloat(values.rate) / 100).toFixed(6)) : 0,
      active: values.active
    }

    const createOrUpdateVatCode = isEditMode ? triggerUpdateVatCode : triggerCreateVatCode

    await createOrUpdateVatCode(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['VAT_CODES'] })
        onSnackbarOpen(isEditMode ? t({ id: 'vatCodeUpdateSuccess' }) : t({ id: 'vatCodeCreateSuccess' }), SnackbarType.SUCCESS)
      },
      onError: (error) => {
        if (isAxiosError(error) && error.response?.status === 400) {
          onSnackbarOpen(isEditMode ? t({ id: 'vatCodeUpdateError' }) : t({ id: 'vatCodeCreateError' }), SnackbarType.ERROR, error.response?.data.detail)

          if (error.response?.data.title === 'ORGANISATION_VAT_ALREADY_EXISTS') {
            formikHelpers.setFieldError('code', error.response.data.detail)
          }
        }
      }
    })
  }

  useEffect(() => {
    if (!isOpen) {
      onVatCodeSelectionReset()
    }
  }, [onVatCodeSelectionReset, isOpen])

  return {
    handleVatCodeDialogClose: handleDialogClose,
    handleVatCodeDialogConfirm: handleDialogConfirm,
    handleVatCodeDialogOpen: handleDialogOpen,
    isVatCodeDialogOpen: isOpen
  }
}
