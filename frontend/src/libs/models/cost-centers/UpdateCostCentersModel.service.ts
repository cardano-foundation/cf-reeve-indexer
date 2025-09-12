import { useMutation } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'
import { CostCenterRequestParameters } from 'libs/api-connectors/backend-connector-lob/api/cost-centers/costCentersApi.types.ts'

const updateCostCenterQuery = async (payload: Partial<CostCenterRequestParameters>) => {
  const { costCentersApi } = backendLobApi()

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
