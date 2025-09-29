import { useMutation } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { BatchApiParameters } from 'libs/api-connectors/backend-connector-reeve/api/batches/batchesApi.types'

const reprocessBatchQuery = async (parameters: BatchApiParameters) => {
  const { batchesApi } = backendReeveApi()

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
