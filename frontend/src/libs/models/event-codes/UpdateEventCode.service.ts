import { useMutation } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { PostEventCode } from 'libs/api-connectors/backend-connector-reeve/api/event-codes/eventCodesApi.types'

const updateEventCodeQuery = async (payload: PostEventCode) => {
  const { eventCodesApi } = backendReeveApi()

  const data = await eventCodesApi.updateEventCode(payload)

  if (!data) return null

  return data
}

export const useUpdateEventCodeModel = () => {
  const { data, mutateAsync } = useMutation({ mutationKey: ['UPDATE_EVENT_CODE'], mutationFn: updateEventCodeQuery })

  return {
    updatedEventCode: data ?? null,
    triggerUpdateEventCode: mutateAsync
  }
}
