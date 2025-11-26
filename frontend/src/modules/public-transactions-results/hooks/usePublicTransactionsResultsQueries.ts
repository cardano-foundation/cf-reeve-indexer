import { useGetPublicTransactionsModel } from 'libs/models/transactions-model/GetPublicTransactions/GetPublicTransactionsModel.service.ts'
import { toDayjs } from 'libs/utils/toDayjs.ts'
import { PublicTransactionsFormValues } from 'modules/public-transactions/components/PublicTransactionsForm/PublicTransactionsForm.types.ts'
import { formatToFloatReadyFormat } from 'modules/public-reports/utils/format.ts'
import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext'

interface PublicTransactionsResultsQueriesState {
  locationState: PublicTransactionsFormValues | null
  pagination: { page: number; rowsPerPage: number }
}

export const usePublicTransactionsResultsQueries = (state: PublicTransactionsResultsQueriesState) => {
  const { locationState, pagination } = state

  const { currency, dateFrom, dateTo, maxAmount, minAmount, blockchainHash } = locationState ?? {}

  const { page, rowsPerPage } = pagination
  const { selectedOrganisation } = useLayoutPublicContext()

  const DEFAULT_REQUEST_PAYLOAD = {
    organisationId: selectedOrganisation,
    currency: undefined,
    dateFrom: undefined,
    dateTo: undefined,
    minAmount: undefined,
    maxAmount: undefined,
    transactionHashes: undefined
  }
  
const request = locationState
  ? {
      organisationId: selectedOrganisation,
      ...(currency && { currency: [currency] }),
      ...(dateFrom && { dateFrom: toDayjs(dateFrom)?.format("YYYY-MM-DD") }),
      ...(dateTo && { dateTo: toDayjs(dateTo)?.format("YYYY-MM-DD") }),
      ...(minAmount && { minAmount: parseFloat(formatToFloatReadyFormat(minAmount)) }),
      ...(maxAmount && { maxAmount: parseFloat(formatToFloatReadyFormat(maxAmount)) }),
      ...(blockchainHash && {
        transactionHashes: blockchainHash
          .split(/,| /)
          .filter((hash) => hash && hash.trim()),
      }),
    }
  : DEFAULT_REQUEST_PAYLOAD;

  const { transactions, total, isTransactionsFetching } = useGetPublicTransactionsModel(request, { size: rowsPerPage, page })

  const isFetching = isTransactionsFetching

  return {
    transactions: transactions ?? [],
    total,
    isFetching
  }
}
