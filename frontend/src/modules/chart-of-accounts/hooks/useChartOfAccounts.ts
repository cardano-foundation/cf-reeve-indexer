import { useChartOfAccountDialog } from 'modules/chart-of-accounts/hooks/useChartOfAccountDialog.ts'
import { useChartOfAccountsQueries } from 'modules/chart-of-accounts/hooks/useChartOfAccountsQueries.ts'
import { useChartOfAccountsSelection } from 'modules/chart-of-accounts/hooks/useChartOfAccountsSelection.ts'
import { useChartOfAccountsSnackbar } from 'modules/chart-of-accounts/hooks/useChartOfAccountsSnackbar.ts'

export const useChartOfAccounts = () => {
  const { chartOfAccounts, hasChartOfAccounts, isFetching } = useChartOfAccountsQueries()

  const { chartOfAccount, handleChartOfAccountSelection, handleChartOfAccountSelectionReset } = useChartOfAccountsSelection({ chartOfAccounts })

  const { snackbar, handleSnackbarClose, handleSnackbarOpen, isSnackbarVisible } = useChartOfAccountsSnackbar()

  const { handleChartOfAccountDialogClose, handleChartOfAccountDialogConfirm, handleChartOfAccountDialogOpen, isChartOfAccountDialogOpen } = useChartOfAccountDialog({
    onChartOfAccountSelectionReset: handleChartOfAccountSelectionReset,
    onSnackbarOpen: handleSnackbarOpen
  })

  const handleChartOfAccountEdit = (id: string) => {
    handleChartOfAccountSelection(id)
    handleChartOfAccountDialogOpen()
  }

  return {
    chartOfAccount,
    chartOfAccounts,
    handleChartOfAccountDialogClose,
    handleChartOfAccountDialogConfirm,
    handleChartOfAccountDialogOpen,
    handleChartOfAccountEdit,
    hasChartOfAccounts,
    isChartOfAccountDialogOpen,
    isFetching,
    snackbar: {
      isSnackbarVisible,
      handleSnackbarClose,
      snackbar
    }
  }
}
