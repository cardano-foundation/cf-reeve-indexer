import { useMutation } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi'
import { BatchApiParameters } from 'libs/api-connectors/backend-connector-lob/api/batches/batchesApi.types'

const reprocessBatchQuery = async (parameters: BatchApiParameters) => {
  const { batchesApi } = backendLobApi()

  const data = await batchesApi.reprocessBatch(parameters)

  if (!data) return null

  return data
}

export const useReprocessBatchModel = () => {
  const { data, mutateAsync, status } = useMutation({ mutationKey: ['BATCH_REPROCESS'], mutationFn: reprocessBatchQuery })

  return {
    reprocessTransactions: mutateAsync,
    reprocess: data,
    status
  }
}
