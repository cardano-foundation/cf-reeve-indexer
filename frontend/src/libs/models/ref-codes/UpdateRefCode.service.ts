import { useMutation } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { PostRefCodeRequest } from 'libs/api-connectors/backend-connector-reeve/api/ref-codes/refCodesApi.types'

const updateRefCodeQuery = async (payload: PostRefCodeRequest) => {
  const { refCodesApi } = backendReeveApi()

  const data = await refCodesApi.updateRefCode(payload)

  if (!data) return null

  return data
}

export const useUpdateRefCodeModel = () => {
  const { data, mutateAsync } = useMutation({ mutationKey: ['UPDATE_REF_CODE'], mutationFn: updateRefCodeQuery })

  return {
    updatedRefCode: data ?? null,
    triggerUpdateRefCode: mutateAsync
  }
}
