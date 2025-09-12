import { useMutation } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'
import { UploadTransactionsApiRequest } from 'libs/api-connectors/backend-connector-lob/api/transactions/transactionsApi.types.ts'

const uploadTransactionsQuery = async (request: UploadTransactionsApiRequest) => {
  const { transactionsApi } = backendLobApi()

  const data = await transactionsApi.uploadTransactions(request)

  if (!data) return null

  return data
}

export const useUploadTransactionsModel = () => {
  const { data, mutateAsync, status } = useMutation({ mutationFn: uploadTransactionsQuery })

  return {
    uploadedTransactions: data,
    status,
    triggerUploadTransactions: mutateAsync
  }
}
