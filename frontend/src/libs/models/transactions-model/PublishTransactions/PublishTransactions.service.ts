import { useMutation } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'
import { PublishTransactionsApiRequest } from 'libs/api-connectors/backend-connector-lob/api/transactions/transactionsApi.types.ts'

const publishTransactionsQuery = async (request: PublishTransactionsApiRequest) => {
  const { transactionsApi } = backendLobApi()

  const data = await transactionsApi.publishTransactions(request)

  if (!data) return null

  return data
}

export const usePublishTransactionsModel = () => {
  const { data, mutateAsync, status } = useMutation({ mutationFn: publishTransactionsQuery })

  return {
    publishTransactions: mutateAsync,
    data,
    status
  }
}
