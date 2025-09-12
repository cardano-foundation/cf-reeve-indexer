import { useMutation } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'
import { UploadCostCentersRequest } from 'libs/api-connectors/backend-connector-lob/api/cost-centers/costCentersApi.types.ts'

const uploadCostCentersQuery = async (payload: UploadCostCentersRequest) => {
  const { costCentersApi } = backendLobApi()

  const data = await costCentersApi.uploadCostCenters(payload)

  if (!data) return null

  return data
}

export const useUploadCostCentersModel = () => {
  const { data, mutateAsync } = useMutation({ mutationKey: ['UPLOAD_COST_CENTERS'], mutationFn: uploadCostCentersQuery })

  return {
    uploadedCostCenters: data ?? null,
    triggerUploadCostCenters: mutateAsync
  }
}
