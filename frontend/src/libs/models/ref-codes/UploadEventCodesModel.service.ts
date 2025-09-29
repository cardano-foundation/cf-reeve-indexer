import { useMutation } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { UploadRefCodesRequest } from 'libs/api-connectors/backend-connector-reeve/api/ref-codes/refCodesApi.types'

const uploadRefCodesQuery = async (payload: UploadRefCodesRequest) => {
  const { refCodesApi } = backendReeveApi()

  const data = await refCodesApi.uploadRefCodes(payload)

  if (!data) return null

  return data
}

export const useUploadRefCodesModel = () => {
  const { data, mutateAsync } = useMutation({ mutationKey: ['UPLOAD_REF_CODES'], mutationFn: uploadRefCodesQuery })

  return {
    uploadedRefCodes: data ?? null,
    triggerUploadRefCodes: mutateAsync
  }
}
