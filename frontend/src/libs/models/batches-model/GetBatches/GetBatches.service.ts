import { useQuery } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'
import { BatchesApiParameters, BatchesApiRequest } from 'libs/api-connectors/backend-connector-lob/api/batches/batchesApi.types.ts'

const getBatchesQuery = async (request: BatchesApiRequest, parameters: BatchesApiParameters) => {
  const { batchesApi } = backendLobApi()

  const data = await batchesApi.getBatches(request, parameters)

  if (!data) return null

  return data
}

export const useGetBatchesModel = (request: BatchesApiRequest, parameters: BatchesApiParameters) => {
  const { data, isFetching, refetch } = useQuery({ queryKey: ['BATCHES'], queryFn: () => getBatchesQuery(request, parameters) })

  return {
    batches: data ?? null,
    isFetching,
    refetch
  }
}
