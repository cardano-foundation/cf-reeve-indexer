import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { BatchesApiParameters, BatchesApiRequest } from 'libs/api-connectors/backend-connector-reeve/api/batches/batchesApi.types.ts'

const getBatchesQuery = async (request: BatchesApiRequest, parameters: BatchesApiParameters) => {
  const { batchesApi } = backendReeveApi()

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
