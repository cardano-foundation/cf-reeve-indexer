import { useMutation } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { RejectTransactionsApiRequest } from 'libs/api-connectors/backend-connector-reeve/api/transactions/transactionsApi.types.ts'

const rejectTransactionsQuery = async (request: RejectTransactionsApiRequest) => {
  const { transactionsApi } = backendReeveApi()

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
