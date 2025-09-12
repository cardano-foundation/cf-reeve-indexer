import { useErrorsSummaryDialog } from 'libs/ui-kit/components/DialogErrorsSummary/useErrorsSummaryDialog.ts'
import { useOrganizationSetupDialog } from 'modules/organization-setup/hooks/useOrganizationSetupDialog.ts'
import { useOrganizationSetupForm } from 'modules/organization-setup/hooks/useOrganizationSetupForm.ts'
import { useOrganizationSetupSnackbar } from 'modules/organization-setup/hooks/useOrganizationSetupSnackbar.ts'

export const useOrganizationSetup = () => {
  const { snackbar, handleSnackbarClose, handleSnackbarOpen, isSnackbarVisible } = useOrganizationSetupSnackbar()

  const { handleDialogOrganizationSetupCancel, handleDialogOrganizationSetupOpen, isDialogOrganizationSetupOpen } = useOrganizationSetupDialog()

  const { handleDialogErrorsSummaryCancel, handleDialogErrorsSummaryOpen, isDialogErrorsSummaryOpen } = useErrorsSummaryDialog()

  const { apiErrors, apiWarnings, initialValues, validationSchema, handleFormSubmit } = useOrganizationSetupForm({
    onDialogOrganizationSetupCancel: handleDialogOrganizationSetupCancel,
    onSnackbarOpen: handleSnackbarOpen
  })

  return {
    apiErrors,
    apiWarnings,
    initialValues,
    snackbar,
    validationSchema,
    handleDialogErrorsSummaryCancel,
    handleDialogErrorsSummaryOpen,
    handleDialogOrganizationSetupCancel,
    handleDialogOrganizationSetupOpen,
    handleFormSubmit,
    handleSnackbarClose,
    isDialogErrorsSummaryOpen,
    isDialogOrganizationSetupOpen,
    isSnackbarVisible
  }
}
