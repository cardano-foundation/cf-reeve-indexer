import { useVatCodeDialog } from 'modules/vat-codes/hooks/useVatCodeDialog.ts'
import { useVatCodesQueries } from 'modules/vat-codes/hooks/useVatCodesQueries.ts'
import { useVatCodesSelection } from 'modules/vat-codes/hooks/useVatCodesSelection.ts'
import { useVatCodesSnackbar } from 'modules/vat-codes/hooks/useVatCodesSnackbar.ts'

export const useVatCodes = () => {
  const { vatCodes, hasVatCodes, isFetching } = useVatCodesQueries()

  const { vatCode, handleVatCodeSelection, handleVatCodeSelectionReset } = useVatCodesSelection({ vatCodes })

  const { snackbar, handleSnackbarClose, handleSnackbarOpen, isSnackbarVisible } = useVatCodesSnackbar()

  const { handleVatCodeDialogClose, handleVatCodeDialogConfirm, handleVatCodeDialogOpen, isVatCodeDialogOpen } = useVatCodeDialog({
    onVatCodeSelectionReset: handleVatCodeSelectionReset,
    onSnackbarOpen: handleSnackbarOpen
  })

  const handleVatCodeEdit = (id: string) => {
    handleVatCodeSelection(id)
    handleVatCodeDialogOpen()
  }

  return {
    snackbar,
    vatCode,
    vatCodes,
    handleSnackbarClose,
    handleVatCodeDialogClose,
    handleVatCodeDialogConfirm,
    handleVatCodeDialogOpen,
    handleVatCodeEdit,
    hasVatCodes,
    isFetching,
    isSnackbarVisible,
    isVatCodeDialogOpen
  }
}
