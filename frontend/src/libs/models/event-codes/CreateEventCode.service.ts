import { useMutation } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'
import { PostEventCode } from 'libs/api-connectors/backend-connector-lob/api/event-codes/eventCodesApi.types.ts'

const createEventCodeQuery = async (payload: PostEventCode) => {
  const { eventCodesApi } = backendLobApi()

  const data = await eventCodesApi.createEventCode(payload)

  if (!data) return null

  return data
}

export const useCreateEventCodeModel = () => {
  const { data, mutateAsync } = useMutation({ mutationKey: ['CREATE_EVENT_CODE'], mutationFn: createEventCodeQuery })

  return {
    createdEventCode: data ?? null,
    triggerCreateEventCode: mutateAsync
  }
}
