import { useMutation } from '@tanstack/react-query'

import { TriggerPasswordResetApiRequest } from 'libs/api-connectors/backend-connector-lob/api/auth/authApi.types.ts'

const triggerPasswordResetQuery = async (request: TriggerPasswordResetApiRequest) => {
  // TODO: finalise when keycloak is configured
  console.log({ request })
  // const { authApi } = backendLobApi()
  //
  // const data = await authApi.triggerPasswordReset(request)
  //
  // if (!data) return null
  //
  // return data
}

export const useTriggerPasswordResetModel = () => {
  const { data, mutateAsync, status } = useMutation({ mutationKey: ['TRIGGER_PASSWORD_RESET'], mutationFn: triggerPasswordResetQuery })

  return {
    triggerPasswordReset: mutateAsync,
    passwordResetData: data,
    status
  }
}
