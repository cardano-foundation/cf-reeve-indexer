import { useDialogAlert } from 'libs/ui-kit/components/DialogAlert/useDialogAlert.ts'

export const useOrganizationSetupDialog = () => {
  const { isOpen, handleDialogClose, handleDialogOpen } = useDialogAlert()

  return {
    handleDialogOrganizationSetupCancel: handleDialogClose,
    handleDialogOrganizationSetupOpen: handleDialogOpen,
    isDialogOrganizationSetupOpen: isOpen
  }
}
