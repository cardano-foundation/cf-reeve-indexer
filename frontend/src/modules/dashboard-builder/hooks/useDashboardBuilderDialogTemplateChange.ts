import { useDialogAlert } from 'libs/ui-kit/components/DialogAlert/useDialogAlert.ts'
import { Template } from 'modules/dashboard-builder/types'

interface DashboardBuilderDialogTemplateChangeState {
  selectedTemplate: Template | null
}

interface DashboardBuilderDialogTemplateChangeHandlers {
  onResetSelectedTemplate: () => void
  onResetSelection: (template: Template) => void
  onTemplate: (template: Template) => void
}

export const useDashboardBuilderDialogTemplateChange = (state: DashboardBuilderDialogTemplateChangeState, handlers: DashboardBuilderDialogTemplateChangeHandlers) => {
  const { selectedTemplate } = state
  const { onResetSelectedTemplate, onResetSelection, onTemplate } = handlers

  const { isOpen, handleDialogClose, handleDialogOpen } = useDialogAlert()

  const handleDialogCancel = () => {
    onResetSelectedTemplate()
    handleDialogClose()
  }

  const handleDialogConfirm = () => {
    if (selectedTemplate) {
      onTemplate(selectedTemplate)
      onResetSelection(selectedTemplate)
      onResetSelectedTemplate()
    }

    handleDialogClose()
  }

  return {
    isDialogTemplateChangeOpen: isOpen,
    handleDialogTemplateChangeCancel: handleDialogCancel,
    handleDialogTemplateChangeConfirm: handleDialogConfirm,
    handleDialogTemplateChangeOpen: handleDialogOpen
  }
}
