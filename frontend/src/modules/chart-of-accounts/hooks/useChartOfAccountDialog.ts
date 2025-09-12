import { useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import dayjs from 'dayjs'
import { FormikHelpers } from 'formik'
import { useEffect } from 'react'

import { PostChartOfAccountRequest } from 'libs/api-connectors/backend-connector-lob/api/chart-of-accounts/chartOfAccountsApi.types'
import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation.tsx'
import { useCreateChartOfAccountModel } from 'libs/models/chart-of-accounts/CreateChartOfAccountsModel.service.ts'
import { useUpdateChartOfAccountModel } from 'libs/models/chart-of-accounts/UpdateChartOfAccountsModel.service.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { useDialogAlert } from 'libs/ui-kit/components/DialogAlert/useDialogAlert.ts'
import { SnackbarType } from 'libs/ui-kit/components/Snackbar/Snackbar.component.tsx'
import { ChartOfAccountFormValues } from 'modules/chart-of-accounts/components/ChartOfAccountForm/ChartOfAccountForm.types.ts'

interface ChartOfAccountDialogHandlers {
  onChartOfAccountSelectionReset: () => void
  onSnackbarOpen: (message: string, type: SnackbarType, hint?: string) => void
}

export const useChartOfAccountDialog = (handlers: ChartOfAccountDialogHandlers) => {
  const queryClient = useQueryClient()
  const { t } = useTranslations()
  const selectedOrganisation = useSelectedOrganisation()
  const { onChartOfAccountSelectionReset, onSnackbarOpen } = handlers

  const { handleDialogClose, handleDialogOpen, isOpen } = useDialogAlert()

  const { triggerCreateChartOfAccount } = useCreateChartOfAccountModel()
  const { triggerUpdateChartOfAccount } = useUpdateChartOfAccountModel()

  const handleDialogConfirm = async (values: ChartOfAccountFormValues, formikHelpers: FormikHelpers<ChartOfAccountFormValues>, isEditMode: boolean) => {
    const payload: Partial<PostChartOfAccountRequest> = {
      organisationId: selectedOrganisation,
      customerCode: values.customerCode,
      name: values.description,
      eventRefCode: values.eventRefCode,
      currency: values.currency,
      type: values.type,
      subType: values.subType,
      counterParty: values.counterParty,
      parentCustomerCode: values.hasParent ? values.parentCustomerCode : '',
      openingBalance: values.hasBalance
        ? {
            balanceFCY: parseFloat(values.balanceFCY.replace(/,/g, '')),
            balanceLCY: parseFloat(values.balanceLCY.replace(/,/g, '')),
            originalCurrencyIdFCY: values.originalCurrencyIdFCY,
            originalCurrencyIdLCY: values.originalCurrencyIdLCY,
            balanceType: values.balanceType,
            date: dayjs(values?.date, 'DD-MM-YYYY').format('YYYY-MM-DD')
          }
        : undefined,
      active: values.active
    }

    const createOrUpdateChartOfAccount = isEditMode ? triggerUpdateChartOfAccount : triggerCreateChartOfAccount

    await createOrUpdateChartOfAccount(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['CHART_OF_ACCOUNT'] })
        onSnackbarOpen(isEditMode ? t({ id: 'chartOfAccountUpdateSuccess' }) : t({ id: 'chartOfAccountCreateSuccess' }), SnackbarType.SUCCESS)
      },
      onError: (error) => {
        if (isAxiosError(error) && error.response && error.response?.status >= 400) {
          onSnackbarOpen(isEditMode ? t({ id: 'chartOfAccountUpdateError' }) : t({ id: 'chartOfAccountCreateError' }), SnackbarType.ERROR, error.response?.data.error.detail)

          if (error.response?.data.error.title === 'CHART_OF_ACCOUNT_ALREADY_EXISTS') {
            formikHelpers.setFieldError('customerCode', error.response?.data.error.detail)
          }
        }
      }
    })
  }

  useEffect(() => {
    if (!isOpen) {
      onChartOfAccountSelectionReset()
    }
  }, [onChartOfAccountSelectionReset, isOpen])

  return {
    handleChartOfAccountDialogClose: handleDialogClose,
    handleChartOfAccountDialogConfirm: handleDialogConfirm,
    handleChartOfAccountDialogOpen: handleDialogOpen,
    isChartOfAccountDialogOpen: isOpen
  }
}
