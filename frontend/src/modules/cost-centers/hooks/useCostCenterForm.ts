import { CostCenterResponse } from 'libs/api-connectors/backend-connector-lob/api/cost-centers/costCentersApi.types.ts'
import { OrganisationApiResponse } from 'libs/api-connectors/backend-connector-lob/api/organisation/organisationApi.types.ts'
import { CostCenterFormValues } from 'modules/cost-centers/components/CostCenterForm/CostCenterForm.types.ts'

interface CostCenterFormState {
  costCenter?: CostCenterResponse
  organisation: OrganisationApiResponse | null
}

interface CostCenterFormHandlers {
  onCancel: () => void
  onConfirm: (values: CostCenterFormValues, isEditMode: boolean) => Promise<void>
}

export const useCostCenterForm = (state: CostCenterFormState, handlers: CostCenterFormHandlers, isEditMode: boolean) => {
  const { costCenter } = state
  const { onCancel, onConfirm } = handlers

  const initialValues: CostCenterFormValues = {
    code: costCenter?.customerCode ?? '',
    description: costCenter?.name ?? '',
    hasParent: Boolean(costCenter?.parent),
    parentCode: costCenter?.parent?.customerCode ?? '',
    active: Boolean(costCenter?.active)
  }

  const handleFormSubmit = async (values: CostCenterFormValues) => {
    await onConfirm(values, isEditMode)
    onCancel()
  }

  return { initialValues, handleFormSubmit }
}
