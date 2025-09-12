import { useDialogAlert } from 'libs/ui-kit/components/DialogAlert/useDialogAlert.ts'
import { ReportParametersFormValues } from 'modules/report-parameters/components/ReportParametersForm/ReportParametersForm.types.ts'

interface DialogReportState {
  values: ReportParametersFormValues
}

interface DialogReportHandlers {
  onReportTypeRedirect: () => void
}

const useDialogReport = (state: DialogReportState, handlers: DialogReportHandlers) => {
  const { values } = state
  const { onReportTypeRedirect } = handlers

  const { isOpen, handleDialogClose, handleDialogOpen } = useDialogAlert()

  const handleDialogCancel = () => {
    handleDialogClose()
  }

  const handleDialogConfirm = () => {
    handleDialogClose()

    if (values) {
      onReportTypeRedirect()
    }
  }

  return {
    isDialogReportOpen: isOpen,
    handleDialogReportCancel: handleDialogCancel,
    handleDialogReportConfirm: handleDialogConfirm,
    handleDialogReportOpen: handleDialogOpen
  }
}

export const useDialogNonPublishedReport = (state: DialogReportState, handlers: DialogReportHandlers) => {
  const { isDialogReportOpen, handleDialogReportCancel, handleDialogReportConfirm, handleDialogReportOpen } = useDialogReport(state, handlers)

  return {
    isDialogNonPublishedReportOpen: isDialogReportOpen,
    handleDialogNonPublishedReportCancel: handleDialogReportCancel,
    handleDialogNonPublishedReportConfirm: handleDialogReportConfirm,
    handleDialogNonPublishedReportOpen: handleDialogReportOpen
  }
}

export const useDialogPublishedReport = (state: DialogReportState, handlers: DialogReportHandlers) => {
  const { isDialogReportOpen, handleDialogReportCancel, handleDialogReportConfirm, handleDialogReportOpen } = useDialogReport(state, handlers)

  return {
    isDialogPublishedReportOpen: isDialogReportOpen,
    handleDialogPublishedReportCancel: handleDialogReportCancel,
    handleDialogPublishedReportConfirm: handleDialogReportConfirm,
    handleDialogPublishedReportOpen: handleDialogReportOpen
  }
}
