import { useMutation } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { PostPublicTransactionsDownloadRequest } from 'libs/api-connectors/backend-connector-reeve/api/transactions/publicTransactionsApi.types.ts'

const downloadPublicTransactionsQuery = async (request: PostPublicTransactionsDownloadRequest) => {
  const { transactionsApi } = backendReeveApi()

  const data = await transactionsApi.downloadTransactions(request)

  if (!data) return null

  return data
}

export const useDownloadPublicTransactionsModel = () => {
  const { mutateAsync, isPending } = useMutation({ mutationKey: ['DOWNLOAD_PUBLIC_TRANSACTIONS'], mutationFn: downloadPublicTransactionsQuery })

  return {
    triggerDownloadTransactions: mutateAsync,
    isDownloadPending: isPending
  }
}
