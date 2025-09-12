import { useErrorsSummaryDialog } from 'libs/ui-kit/components/DialogErrorsSummary/useErrorsSummaryDialog.ts'
import { useImportForm } from 'modules/import/hooks/useImportForm.ts'
import { useImportQueries } from 'modules/import/hooks/useImportQueries.ts'
import { useImportSnackbar } from 'modules/import/hooks/useImportSnackbar.ts'

export const useImport = () => {
  const { organisations, transactionTypes, isFetching } = useImportQueries()

  const { snackbar, handleSnackbarClose, handleSnackbarOpen, isSnackbarVisible } = useImportSnackbar()

  const { handleDialogErrorsSummaryCancel, handleDialogErrorsSummaryOpen, isDialogErrorsSummaryOpen } = useErrorsSummaryDialog()

  const { apiErrors, dateFromMaxDate, dateFromMinDate, dateToMaxDate, dateToMinDate, initialValues, validationSchema, handleFormSubmit } = useImportForm(
    { organisations, transactionTypes },
    { onSnackbarOpen: handleSnackbarOpen }
  )

  return {
    apiErrors,
    dateFromMaxDate,
    dateFromMinDate,
    dateToMaxDate,
    dateToMinDate,
    initialValues,
    organisations,
    snackbar,
    transactionTypes,
    validationSchema,
    handleDialogErrorsSummaryCancel,
    handleDialogErrorsSummaryOpen,
    handleFormSubmit,
    handleSnackbarClose,
    isDialogErrorsSummaryOpen,
    isFetching,
    isSnackbarVisible
  }
}
