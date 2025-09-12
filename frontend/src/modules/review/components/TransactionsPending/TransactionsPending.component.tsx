import { usePrevious } from 'hooks'
import { BatchStatistics } from 'libs/api-connectors/backend-connector-lob/api/batches/batchesApi.types.ts'
import { usePagination } from 'libs/hooks/usePagination.ts'
import { useSorting } from 'libs/hooks/useSorting.ts'
import { Snackbar } from 'libs/ui-kit/components/Snackbar/Snackbar.component.tsx'
import { useBatchContext } from 'modules/review/components/BatchContext/hooks/useBatchContext.tsx'
import { TableBatchReviewPending } from 'modules/review/components/TableBatchReviewPending/TableBatchReviewPending.component.tsx'
import { useTransactionsReprocess } from 'modules/review/components/TransactionsPending/hooks/useTransactionsReprocess.ts'
import { useTransactionsReprocessContext } from 'modules/review/components/TransactionsReprocessContext/hooks/useTransactionsReprocessContext.tsx'
import { useBatchDetailsContext } from 'modules/review/hooks/useBatchDetailsContext.ts'
import { useBatchDetailsQueries } from 'modules/review/hooks/useBatchDetailsQueries.ts'

export const TransactionsPending = () => {
  const { selectedBatchId } = useBatchContext()
  const { filters, quickFilters, areFiltersSubmitted } = useBatchDetailsContext()
  const { hint, message, handleClose, isReprocessing, isSnackbarVisible } = useTransactionsReprocessContext()

  const { page, rowsPerPage, handlePagination } = usePagination()

  const { sortBy, sortOrder, handleSorting } = useSorting({ field: 'entryDate', sort: 'desc' })

  const { batch, isFetching } = useBatchDetailsQueries({
    filters,
    quickFilters,
    pagination: { page, size: rowsPerPage },
    sorting: { sortBy, sortOrder },
    selectedBatchId,
    status: [BatchStatistics.PENDING],
    areFiltersSubmitted,
    isReprocessing
  })

  const prevPendingTransactionsCount = usePrevious(batch?.batchStatistics?.pending)

  const pendingTransactionsCount = batch?.batchStatistics?.pending

  useTransactionsReprocess({ pendingTransactionsCount, prevPendingTransactionsCount })

  return (
    <>
      <TableBatchReviewPending data={batch} pagination={{ handlePagination }} sorting={{ handleSorting }} isFetching={isFetching} isReprocessing={isReprocessing} />
      {/* TODO: Snackbar should be a part of root layout and modified with context methods */}
      <Snackbar key={message} open={isSnackbarVisible} onClose={handleClose} hint={hint} message={message} />
    </>
  )
}
