import { useMutation } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'
import { PostRefCodeRequest } from 'libs/api-connectors/backend-connector-lob/api/ref-codes/refCodesApi.types.ts'

const createRefCodeQuery = async (payload: PostRefCodeRequest) => {
  const { refCodesApi } = backendLobApi()

  const data = await refCodesApi.createRefCode(payload)

  if (!data) return null

  return data
}

export const useCreateRefCodeModel = () => {
  const { data, mutateAsync } = useMutation({ mutationKey: ['CREATE_REF_CODE'], mutationFn: createRefCodeQuery })

  return {
    createdRefCode: data ?? null,
    triggerCreateRefCode: mutateAsync
  }
}
