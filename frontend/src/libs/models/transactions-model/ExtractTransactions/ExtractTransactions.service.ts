import { useMutation } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'
import { ExtractTransactionsApiRequest } from 'libs/api-connectors/backend-connector-lob/api/transactions/transactionsApi.types.ts'

const extractTransactionsQuery = async (request: ExtractTransactionsApiRequest) => {
  const { transactionsApi } = backendLobApi()

  const data = await transactionsApi.extractTransactions(request)

  if (!data) return null

  return data
}

export const useExtractTransactionsModel = () => {
  const { data, mutateAsync, status } = useMutation({ mutationFn: extractTransactionsQuery })

  return {
    importedTransactions: data,
    status,
    triggerImportTransactions: mutateAsync
  }
}
