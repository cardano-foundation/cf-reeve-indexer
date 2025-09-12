import { useLocationState } from 'hooks'
import { usePagination } from 'libs/hooks/usePagination.ts'
import { PublicTransactionsFormValues } from 'modules/public-transactions/components/PublicTransactionsForm/PublicTransactionsForm.types.ts'
import { usePublicTransactionsResultsQueries } from 'modules/public-transactions-results/hooks/usePublicTransactionsResultsQueries.ts'
import { usePublicTransactionsResultsSnackbars } from 'modules/public-transactions-results/hooks/usePublicTransactionsResultsSnackbars.ts'

export const usePublicTransactionsResults = () => {
  const { state } = useLocationState<PublicTransactionsFormValues>()

  const { page, rowsPerPage, handlePagination } = usePagination()

  const { transactions, total, isFetching } = usePublicTransactionsResultsQueries({ locationState: state, pagination: { page, rowsPerPage } })

  const { snackbar, isSnackbarVisible, handleClose } = usePublicTransactionsResultsSnackbars({ isFetching })

  const { currency, dateFrom, dateTo, minAmount, maxAmount, blockchainHash } = state ?? {}

  const hasEmptyPageState = !isFetching && transactions?.length === 0

  return {
    blockchainHash,
    currency,
    dateFrom,
    dateTo,
    minAmount,
    maxAmount,
    pagination: { page, rowsPerPage },
    snackbar,
    transactions,
    total,
    handleClose,
    handlePagination,
    hasEmptyPageState,
    isFetching,
    isSnackbarVisible
  }
}
