import { useMutation } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'
import { RejectTransactionsApiRequest } from 'libs/api-connectors/backend-connector-lob/api/transactions/transactionsApi.types.ts'

const rejectTransactionsQuery = async (request: RejectTransactionsApiRequest) => {
  const { transactionsApi } = backendLobApi()

  const data = await transactionsApi.rejectTransactions(request)

  if (!data) return null

  return data
}

export const useRejectTransactionsModel = () => {
  const { data, mutateAsync, status } = useMutation({ mutationFn: rejectTransactionsQuery })

  return {
    rejectTransaction: mutateAsync,
    data,
    status
  }
}
