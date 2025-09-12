import { useMutation } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'
import { UploadVatCodesRequest } from 'libs/api-connectors/backend-connector-lob/api/vat-codes/vatCodesApi.types.ts'

const uploadVatCodesQuery = async (payload: UploadVatCodesRequest) => {
  const { vatCodesApi } = backendLobApi()

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
