import { BatchStatistics } from 'libs/api-connectors/backend-connector-lob/api/batches/batchesApi.types.ts'
import { usePagination } from 'libs/hooks/usePagination.ts'
import { useSorting } from 'libs/hooks/useSorting.ts'
import { useBatchContext } from 'modules/review/components/BatchContext/hooks/useBatchContext.tsx'
import { TableBatchReviewInvalid } from 'modules/review/components/TableBatchReviewInvalid/TableBatchReviewInvalid.component.tsx'
import { useBatchDetailsContext } from 'modules/review/hooks/useBatchDetailsContext.ts'
import { useBatchDetailsQueries } from 'modules/review/hooks/useBatchDetailsQueries.ts'

export const TransactionsInvalid = () => {
  const { selectedBatchId } = useBatchContext()
  const { filters, quickFilters, areFiltersSubmitted } = useBatchDetailsContext()

  const { page, rowsPerPage, handlePagination } = usePagination()

  const { sortBy, sortOrder, handleSorting } = useSorting({ field: 'entryDate', sort: 'desc' })

  const { batch, isFetching } = useBatchDetailsQueries({
    filters,
    quickFilters,
    pagination: { page, size: rowsPerPage },
    sorting: { sortBy, sortOrder },
    selectedBatchId,
    status: [BatchStatistics.INVALID],
    areFiltersSubmitted
  })

  return <TableBatchReviewInvalid data={batch} pagination={{ handlePagination }} sorting={{ handleSorting }} isFetching={isFetching} />
}
