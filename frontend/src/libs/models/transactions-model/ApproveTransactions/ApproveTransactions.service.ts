import { useMutation } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'
import { ApproveTransactionsApiRequest } from 'libs/api-connectors/backend-connector-lob/api/transactions/transactionsApi.types.ts'

const approveTransactionsQuery = async (request: ApproveTransactionsApiRequest) => {
  const { transactionsApi } = backendLobApi()

  const data = await transactionsApi.approveTransactions(request)

  if (!data) return null

  return data
}

export const useApproveTransactionsModel = () => {
  const { data, mutateAsync, status } = useMutation({ mutationFn: approveTransactionsQuery })

  return {
    approveTransactions: mutateAsync,
    data,
    status
  }
}
