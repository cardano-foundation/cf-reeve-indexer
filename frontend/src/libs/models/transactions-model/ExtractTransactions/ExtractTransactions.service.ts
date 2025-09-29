import { useMutation } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { ExtractTransactionsApiRequest } from 'libs/api-connectors/backend-connector-reeve/api/transactions/transactionsApi.types.ts'

const extractTransactionsQuery = async (request: ExtractTransactionsApiRequest) => {
  const { transactionsApi } = backendReeveApi()

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
