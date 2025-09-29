import { useMutation } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { UploadTransactionsApiRequest } from 'libs/api-connectors/backend-connector-reeve/api/transactions/transactionsApi.types.ts'

const uploadTransactionsQuery = async (request: UploadTransactionsApiRequest) => {
  const { transactionsApi } = backendReeveApi()

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
