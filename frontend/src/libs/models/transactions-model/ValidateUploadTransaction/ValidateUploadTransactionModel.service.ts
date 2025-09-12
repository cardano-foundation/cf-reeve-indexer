import { useMutation } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'
import { UploadTransactionsApiRequest } from 'libs/api-connectors/backend-connector-lob/api/transactions/transactionsApi.types.ts'

const validateUploadTransactionsQuery = async (request: UploadTransactionsApiRequest) => {
  const { transactionsApi } = backendLobApi()

  const data = await transactionsApi.validateUploadTransactions(request)

  if (!data) return null

  return data
}

export const useValidateUploadTransactionsModel = () => {
  const { data, mutateAsync, status } = useMutation({ mutationFn: validateUploadTransactionsQuery })

  return {
    validatedUploadTransactions: data,
    status,
    triggerValidateUploadTransactions: mutateAsync
  }
}
