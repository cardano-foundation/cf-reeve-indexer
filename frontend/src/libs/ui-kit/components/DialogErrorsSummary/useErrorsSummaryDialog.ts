import { useDialogAlert } from 'libs/ui-kit/components/DialogAlert/useDialogAlert.ts'

export const useErrorsSummaryDialog = () => {
  const { isOpen, handleDialogClose, handleDialogOpen } = useDialogAlert()

  return {
    handleDialogErrorsSummaryCancel: handleDialogClose,
    handleDialogErrorsSummaryOpen: handleDialogOpen,
    isDialogErrorsSummaryOpen: isOpen
  }
}
