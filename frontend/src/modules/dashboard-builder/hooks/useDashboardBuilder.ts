import { SelectChangeEvent } from '@mui/material/Select'

import { useDashboardFiltersForm } from 'libs/ui-kit/components/DashboardFilters/DashboardFilters.hooks.ts'
import { useChartsData } from 'modules/dashboard-builder/hooks/useChartsData.ts'
import { useDashboardBuilderDialogTemplateChange } from 'modules/dashboard-builder/hooks/useDashboardBuilderDialogTemplateChange.ts'
import { useDashboardBuilderDialogTemplateSave } from 'modules/dashboard-builder/hooks/useDashboardBuilderDialogTemplateSave.ts'
import { useDashboardBuillderQueries } from 'modules/dashboard-builder/hooks/useDashboardBuilderQueries.ts'
import { useDashboardBuilderTemplateSlot } from 'modules/dashboard-builder/hooks/useDashboardBuilderTemplateSlot.ts'
import { useSelectedTemplate } from 'modules/dashboard-builder/hooks/useSelectedTemplate.ts'
import { useTemplate } from 'modules/dashboard-builder/hooks/useTemplate.ts'
import { Template } from 'modules/dashboard-builder/types'

export const useDashboardBuilder = () => {
  const { formik } = useDashboardFiltersForm()

  const { availableMetrics, dashboard, metrics, isFetching } = useDashboardBuillderQueries({ formik })

  const { template, handleTemplate } = useTemplate({ dashboard })

  const { selectedTemplate, handleSelectedTemplate, handleResetSelectedTemplate } = useSelectedTemplate()

  const { options, selection, isSaveDisabled, isSelectionDirty, handleClear, handleSelect, handleResetSelection } = useDashboardBuilderTemplateSlot({ dashboard, template })

  const { isDialogTemplateChangeOpen, handleDialogTemplateChangeCancel, handleDialogTemplateChangeConfirm, handleDialogTemplateChangeOpen } =
    useDashboardBuilderDialogTemplateChange(
      { selectedTemplate },
      { onResetSelectedTemplate: handleResetSelectedTemplate, onResetSelection: handleResetSelection, onTemplate: handleTemplate }
    )

  const { isDialogTemplateSaveOpen, handleDialogTemplateSaveCancel, handleDialogTemplateSaveConfirm, handleDialogTemplateSaveOpen } = useDashboardBuilderDialogTemplateSave({
    availableMetrics,
    dashboard,
    selection,
    template
  })

  const data = useChartsData(availableMetrics, metrics)

  const isNavigationBlocked = isSelectionDirty && !isDialogTemplateSaveOpen

  const handleTemplateChange = (event: SelectChangeEvent<unknown>) => {
    const template = event.target.value as Template

    if (isSelectionDirty) {
      handleSelectedTemplate(template)
      handleDialogTemplateChangeOpen()
    } else {
      handleTemplate(template)
      handleResetSelection(template)
    }
  }

  return {
    data,
    formik,
    options,
    selection,
    template,
    isFetching,
    isNavigationBlocked,
    isSaveDisabled,
    isDialogTemplateChangeOpen,
    isDialogTemplateSaveOpen,
    handleDialogTemplateChangeCancel,
    handleDialogTemplateChangeConfirm,
    handleDialogTemplateSaveCancel,
    handleDialogTemplateSaveConfirm,
    handleDialogTemplateSaveOpen,
    handleClear,
    handleSelect,
    handleTemplateChange
  }
}
