import { useQuery } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'
import { GetExtractedTransactionsRequest } from 'libs/api-connectors/backend-connector-lob/api/extraction/extractionApi.types.ts'

const getExtractedTransactionsQuery = async (request: GetExtractedTransactionsRequest) => {
  const { extractionApi } = backendLobApi()

  const data = await extractionApi.getExtractedTransactions(request)

  if (!data) return null

  return data
}

export const useGetExtractedTransactionsModel = (request: GetExtractedTransactionsRequest) => {
  const { data, isFetching } = useQuery({ queryKey: ['EXTRACTED_TRANSACTIONS', request], queryFn: () => getExtractedTransactionsQuery(request) })

  return {
    transactions: data?.transactions ?? null,
    isTransactionsFetching: isFetching
  }
}
