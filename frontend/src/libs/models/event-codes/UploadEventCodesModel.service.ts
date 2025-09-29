import { useMutation } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { UploadEventCodesRequest } from 'libs/api-connectors/backend-connector-reeve/api/event-codes/eventCodesApi.types'

const uploadEventCodesQuery = async (payload: UploadEventCodesRequest) => {
  const { eventCodesApi } = backendReeveApi()

  const data = await eventCodesApi.uploadEventCodes(payload)

  if (!data) return null

  return data
}

export const useUploadEventCodesModel = () => {
  const { data, mutateAsync } = useMutation({ mutationKey: ['UPLOAD_EVENT_CODES'], mutationFn: uploadEventCodesQuery })

  return {
    uploadedEventCodes: data ?? null,
    triggerUploadEventCodes: mutateAsync
  }
}
