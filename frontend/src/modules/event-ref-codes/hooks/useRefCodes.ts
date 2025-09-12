import { useEventRefCodeSnackbar } from 'modules/event-ref-codes/hooks/useEventRefCodeSnackbar.ts'
import { useRefCodeDialog } from 'modules/event-ref-codes/hooks/useRefCodeDialog.ts'
import { useRefCodesQueries } from 'modules/event-ref-codes/hooks/useRefCodesQueries.ts'
import { useRefCodesSelection } from 'modules/event-ref-codes/hooks/useRefCodesSelection.ts'

export const useRefCodes = () => {
  const { refCodes, hasRefCodes, isFetching } = useRefCodesQueries()

  const { refCode, handleRefCodeSelection, handleRefCodeSelectionReset } = useRefCodesSelection({ refCodes })

  const { snackbar, handleSnackbarClose, handleSnackbarOpen, isSnackbarVisible } = useEventRefCodeSnackbar()

  const { handleRefCodeDialogClose, handleRefCodeDialogConfirm, handleRefCodeDialogOpen, isRefCodeDialogOpen } = useRefCodeDialog({
    onRefCodeSelectionReset: handleRefCodeSelectionReset,
    onSnackbarOpen: handleSnackbarOpen
  })

  const handleRefCodeEdit = (id: string) => {
    handleRefCodeSelection(id)
    handleRefCodeDialogOpen()
  }

  return {
    refCode,
    refCodes,
    handleRefCodeDialogClose,
    handleRefCodeDialogConfirm,
    handleRefCodeDialogOpen,
    handleRefCodeEdit,
    hasRefCodes,
    isRefCodeDialogOpen,
    isFetching,
    snackbar: {
      isSnackbarVisible,
      handleSnackbarClose,
      snackbar
    }
  }
}
