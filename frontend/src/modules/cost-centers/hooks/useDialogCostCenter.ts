import { CostCenterResponse } from 'libs/api-connectors/backend-connector-lob/api/cost-centers/costCentersApi.types.ts'
import { CostCenterFormValues } from 'modules/cost-centers/components/CostCenterForm/CostCenterForm.types.ts'
import { useCostCenterForm } from 'modules/cost-centers/hooks/useCostCenterForm.ts'
import { useDialogCostCentersQueries } from 'modules/cost-centers/hooks/useDialogCostCentersQueries.ts'

interface DialogCostCenterState {
  costCenter?: CostCenterResponse
}

interface DialogCostCenterHandlers {
  onCancel: () => void
  onConfirm: (values: CostCenterFormValues, isEditMode: boolean) => Promise<void>
}

export const useDialogCostCenter = (state: DialogCostCenterState, handlers: DialogCostCenterHandlers) => {
  const { costCenter } = state
  const { onCancel, onConfirm } = handlers

  const { organisation, isFetching } = useDialogCostCentersQueries()

  const isEditMode = Boolean(costCenter?.customerCode)

  const { initialValues, handleFormSubmit } = useCostCenterForm({ costCenter, organisation }, { onCancel, onConfirm }, isEditMode)

  return {
    initialValues,
    organisation,
    handleFormSubmit,
    isEditMode,
    isFetching
  }
}
