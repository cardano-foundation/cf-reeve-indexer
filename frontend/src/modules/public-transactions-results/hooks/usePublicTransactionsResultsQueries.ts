import { useGetPublicTransactionsModel } from 'libs/models/public-transactions-model/GetPublicTransactions/GetPublicTransactionsModel.service.ts'
import { toDayjs } from 'libs/utils/toDayjs.ts'
import { PublicTransactionsFormValues } from 'modules/public-transactions/components/PublicTransactionsForm/PublicTransactionsForm.types.ts'
import { formatToFloatReadyFormat } from 'modules/report-type/utils/format.ts'

interface PublicTransactionsResultsQueriesState {
  locationState: PublicTransactionsFormValues | null
  pagination: { page: number; rowsPerPage: number }
}

export const usePublicTransactionsResultsQueries = (state: PublicTransactionsResultsQueriesState) => {
  const { locationState, pagination } = state

  const { currency, dateFrom, dateTo, maxAmount, minAmount, blockchainHash } = locationState ?? {}

  const { page, rowsPerPage } = pagination

  const selectedOrganisation = '75f95560c1d883ee7628993da5adf725a5d97a13929fd4f477be0faf5020ca94'

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
        currency: currency ? [currency] : [],
        dateFrom: dateFrom ? toDayjs(dateFrom)?.format('YYYY-MM-DD') : undefined,
        dateTo: dateTo ? toDayjs(dateTo)?.format('YYYY-MM-DD') : undefined,
        minAmount: minAmount ? parseFloat(formatToFloatReadyFormat(minAmount)) : undefined,
        maxAmount: maxAmount ? parseFloat(formatToFloatReadyFormat(maxAmount)) : undefined,
        transactionHashes: blockchainHash ? blockchainHash.split(/,| /).filter((hash) => hash && hash.trim()) : []
      }
    : DEFAULT_REQUEST_PAYLOAD

  const { transactions, total, isTransactionsFetching } = useGetPublicTransactionsModel(request, { size: rowsPerPage, page })

  const isFetching = isTransactionsFetching

  return {
    transactions: transactions ?? [],
    total,
    isFetching
  }
}
