import { UseMutateAsyncFunction, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'

import { TriggerReconciliationApiRequest, TriggerReconciliationApiResponse } from 'libs/api-connectors/backend-connector-lob/api/reconciliation/reconciliationApi.types.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { useDialogAlert } from 'libs/ui-kit/components/DialogAlert/useDialogAlert.ts'
import { SnackbarType } from 'libs/ui-kit/components/Snackbar/Snackbar.component.tsx'
import { ReconciliationFormValues } from 'modules/reconciliation/components/ReconciliationForm/ReconciliationForm.types.ts'

interface ReconciliationDialogHandlers {
  onSnackbarOpen: (message: string, type: SnackbarType, hint?: string) => void
  triggerReconciliation: UseMutateAsyncFunction<TriggerReconciliationApiResponse | null, Error, TriggerReconciliationApiRequest>
}

export const useReconciliationDialog = (handlers: ReconciliationDialogHandlers) => {
  const { onSnackbarOpen, triggerReconciliation } = handlers

  const queryClient = useQueryClient()

  const { t } = useTranslations()

  const { handleDialogClose, handleDialogOpen, isOpen } = useDialogAlert()

  const handleDialogConfirm = async (values: ReconciliationFormValues) => {
    await triggerReconciliation(
      {
        organisationId: values.organisation,
        dateFrom: dayjs(values.dateFrom).format('YYYY-MM-DD'),
        dateTo: dayjs(values.dateTo).format('YYYY-MM-DD')
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['TRANSACTIONS_RECONCILE'] })
          onSnackbarOpen(t({ id: 'reconciliationInProgress' }), SnackbarType.LOADING, t({ id: 'loadingHint' }))
        }
      }
    )
  }

  return {
    handleReconciliationDialogClose: handleDialogClose,
    handleReconciliationDialogConfirm: handleDialogConfirm,
    handleReconciliationDialogOpen: handleDialogOpen,
    isReconciliationDialogOpen: isOpen
  }
}
