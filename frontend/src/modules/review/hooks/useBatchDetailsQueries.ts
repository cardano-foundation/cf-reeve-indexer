import { useMemo } from 'react'

import type { BatchDetailsFiltersValues, BatchDetailsQuickFiltersValues } from 'features/ui'
import { mapFiltersToApiParams } from 'features/ui/batch-details-filters/mapFiltersToApiParams'
import type { PostBatchDetailsRequestBody, BatchStatistics } from 'libs/api-connectors/backend-connector-lob/api/batches/batchesApi.types.ts'
import { useGetBatchModel } from 'libs/models/batches-model/GetBatch/GetBatch.service.ts'

interface BatchDetailsQueriesState {
  filters: BatchDetailsFiltersValues
  quickFilters: BatchDetailsQuickFiltersValues
  pagination: { page: number; size: number }
  sorting: { sortBy: string; sortOrder: 'asc' | 'desc' }
  selectedBatchId: string
  status: BatchStatistics[]
  areFiltersSubmitted: boolean
  isReprocessing?: boolean
}

export const useBatchDetailsQueries = (state: BatchDetailsQueriesState) => {
  const {
    filters,
    quickFilters,
    pagination: { page, size },
    sorting: { sortBy, sortOrder },
    selectedBatchId,
    status,
    areFiltersSubmitted,
    isReprocessing
  } = state

  // Build clean API payload from filters
  const filtersPayload: Partial<PostBatchDetailsRequestBody> = useMemo(() => {
    return mapFiltersToApiParams({
      ...filters,
      // Quick filters can override drawer filters
      transactionType: quickFilters.transactionType ?? filters.transactionType
    })
  }, [filters, quickFilters])

  // Check if there’s at least one active filter
  const hasSomeFilters = Object.keys(filtersPayload).length > 0

  const { batch, refetch, isFetching } = useGetBatchModel(
    {
      parameters: {
        batchId: selectedBatchId,
        page,
        size,
        sort: [`${sortBy},${sortOrder}`],
        status
      },
      body: { ...(hasSomeFilters ? filtersPayload : {}) }
    },
    true,
    isReprocessing,
    [quickFilters, areFiltersSubmitted]
  )

  return { batch, refetch, isFetching }
}
