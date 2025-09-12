import { useTriggerReconciliationModel } from 'libs/models/reconciliation-model/TriggerReconcioiation/TriggerReconciliation.service.ts'
import { useReconciliationDialog } from 'modules/reconciliation/hooks/useReconciliationDialog.ts'
import { useReconciliationQueries } from 'modules/reconciliation/hooks/useReconciliationQueries.ts'
import { useReconciliationSnackbar } from 'modules/reconciliation/hooks/useReconciliationSnackbar.ts'

export const useReconciliation = () => {
  const { hasBeenReconciled, isFetching } = useReconciliationQueries()

  const { triggerReconciliation } = useTriggerReconciliationModel()

  const { snackbar, handleSnackbarClose, handleSnackbarOpen, isSnackbarVisible } = useReconciliationSnackbar()

  const { handleReconciliationDialogClose, handleReconciliationDialogConfirm, handleReconciliationDialogOpen, isReconciliationDialogOpen } = useReconciliationDialog({
    onSnackbarOpen: handleSnackbarOpen,
    triggerReconciliation
  })

  return {
    snackbar,
    handleReconciliationDialogClose,
    handleReconciliationDialogConfirm,
    handleReconciliationDialogOpen,
    handleSnackbarClose,
    handleSnackbarOpen,
    hasBeenReconciled,
    isFetching,
    isReconciliationDialogOpen,
    isSnackbarVisible
  }
}
