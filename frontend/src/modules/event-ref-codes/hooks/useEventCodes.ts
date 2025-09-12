import { useEventCodeDialog } from 'modules/event-ref-codes/hooks/useEventCodeDialog.ts'
import { useEventCodesQueries } from 'modules/event-ref-codes/hooks/useEventCodesQueries.ts'
import { useEventCodesSelection } from 'modules/event-ref-codes/hooks/useEventCodesSelection.ts'
import { useEventRefCodeSnackbar } from 'modules/event-ref-codes/hooks/useEventRefCodeSnackbar.ts'

export const useEventCodes = () => {
  const { eventCodes, isFetching } = useEventCodesQueries()

  const { eventCode, handleEventCodeSelection, handleEventCodeSelectionReset } = useEventCodesSelection({ eventCodes })

  const { snackbar, handleSnackbarClose, handleSnackbarOpen, isSnackbarVisible } = useEventRefCodeSnackbar()

  const { handleEventCodeDialogClose, handleEventCodeDialogConfirm, handleEventCodeDialogOpen, isEventCodeDialogOpen } = useEventCodeDialog({
    onEventCodeSelectionReset: handleEventCodeSelectionReset,
    onSnackbarOpen: handleSnackbarOpen
  })

  const handleEventCodeEdit = (id: string) => {
    handleEventCodeSelection(id)
    handleEventCodeDialogOpen()
  }

  const hasEventCodes = eventCodes && eventCodes.length > 0

  return {
    eventCode,
    eventCodes,
    hasEventCodes,
    handleEventCodeDialogClose,
    handleEventCodeDialogConfirm,
    handleEventCodeDialogOpen,
    handleEventCodeEdit,
    isEventCodeDialogOpen,
    isFetching,
    snackbar: {
      isSnackbarVisible,
      handleSnackbarClose,
      snackbar
    }
  }
}
