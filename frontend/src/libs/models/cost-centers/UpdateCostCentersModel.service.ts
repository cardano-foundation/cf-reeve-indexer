import { useMutation } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { CostCenterRequestParameters } from 'libs/api-connectors/backend-connector-reeve/api/cost-centers/costCentersApi.types.ts'

const updateCostCenterQuery = async (payload: Partial<CostCenterRequestParameters>) => {
  const { costCentersApi } = backendReeveApi()

  const data = await costCentersApi.updateCostCenter(payload)

  if (!data) return null

  return data
}

export const useUpdateCostCenterModel = () => {
  const { data, mutateAsync } = useMutation({ mutationKey: ['UPDATE_COST_CENTER'], mutationFn: updateCostCenterQuery })

  return {
    updatedCostCenter: data ?? null,
    triggerUpdateCostCenter: mutateAsync
  }
}
