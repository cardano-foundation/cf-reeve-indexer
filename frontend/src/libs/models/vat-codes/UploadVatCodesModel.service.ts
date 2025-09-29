import { useMutation } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { UploadVatCodesRequest } from 'libs/api-connectors/backend-connector-reeve/api/vat-codes/vatCodesApi.types.ts'

const uploadVatCodesQuery = async (payload: UploadVatCodesRequest) => {
  const { vatCodesApi } = backendReeveApi()

  const data = await vatCodesApi.uploadVatCodes(payload)

  if (!data) return null

  return data
}

export const useUploadVatCodesModel = () => {
  const { data, mutateAsync } = useMutation({ mutationKey: ['UPLOAD_VAT_CODES'], mutationFn: uploadVatCodesQuery })

  return {
    uploadedVatCodes: data ?? null,
    triggerUploadVatCodes: mutateAsync
  }
}
