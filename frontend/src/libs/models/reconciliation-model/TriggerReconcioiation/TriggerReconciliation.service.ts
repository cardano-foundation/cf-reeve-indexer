import { useMutation } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'
import { TriggerReconciliationApiRequest } from 'libs/api-connectors/backend-connector-lob/api/reconciliation/reconciliationApi.types.ts'

const triggerReconciliationQuery = async (request: TriggerReconciliationApiRequest) => {
  const { reconciliationApi } = backendLobApi()

  const data = await reconciliationApi.triggerReconciliation(request)

  if (!data) return null

  return data
}

export const useTriggerReconciliationModel = () => {
  const { data, mutateAsync, status } = useMutation({ mutationKey: ['TRIGGER_RECONCILIATION'], mutationFn: triggerReconciliationQuery })

  return {
    triggerReconciliation: mutateAsync,
    reconciliationData: data,
    status
  }
}
