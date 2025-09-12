import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'
import { PostBatchDetailsRequest } from 'libs/api-connectors/backend-connector-lob/api/batches/batchesApi.types.ts'

const getBatchQuery = async (request: PostBatchDetailsRequest) => {
  const { batchesApi } = backendLobApi()

  const data = await batchesApi.getBatch(request)

  if (!data) return null

  return data
}

export const useGetBatchModel = (request: PostBatchDetailsRequest, enabled: boolean = true, isReprocessing: boolean = false, dependencies: unknown[] = []) => {
  const { data, isFetching, refetch } = useQuery({
    queryKey: ['BATCH', ...dependencies],
    queryFn: () => getBatchQuery(request),
    enabled,
    placeholderData: keepPreviousData,
    refetchInterval: isReprocessing ? 15000 : undefined
  })

  return {
    batch: data ?? null,
    isFetching,
    refetch
  }
}
