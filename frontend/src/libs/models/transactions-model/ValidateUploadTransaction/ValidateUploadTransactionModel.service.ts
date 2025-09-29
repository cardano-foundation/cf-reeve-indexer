import { useMutation } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { UploadTransactionsApiRequest } from 'libs/api-connectors/backend-connector-reeve/api/transactions/transactionsApi.types.ts'

const validateUploadTransactionsQuery = async (request: UploadTransactionsApiRequest) => {
  const { transactionsApi } = backendReeveApi()

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
