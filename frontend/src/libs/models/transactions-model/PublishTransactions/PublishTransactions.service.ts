import { useMutation } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { PublishTransactionsApiRequest } from 'libs/api-connectors/backend-connector-reeve/api/transactions/transactionsApi.types.ts'

const publishTransactionsQuery = async (request: PublishTransactionsApiRequest) => {
  const { transactionsApi } = backendReeveApi()

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
