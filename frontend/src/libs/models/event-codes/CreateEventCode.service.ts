import { useMutation } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { PostEventCode } from 'libs/api-connectors/backend-connector-reeve/api/event-codes/eventCodesApi.types.ts'

const createEventCodeQuery = async (payload: PostEventCode) => {
  const { eventCodesApi } = backendReeveApi()

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
