import { useMutation } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'
import { CostCenterRequestParameters } from 'libs/api-connectors/backend-connector-lob/api/cost-centers/costCentersApi.types.ts'

const createCostCenterQuery = async (payload: Partial<CostCenterRequestParameters>) => {
  const { costCentersApi } = backendLobApi()

  const data = await costCentersApi.createCostCenter(payload)

  if (!data) return null

  return data
}

export const useCreateCostCenterModel = () => {
  const { data, mutateAsync } = useMutation({ mutationKey: ['CREATE_COST_CENTER'], mutationFn: createCostCenterQuery })

  return {
    updatedCostCenter: data ?? null,
    triggerCreateCostCenter: mutateAsync
  }
}
