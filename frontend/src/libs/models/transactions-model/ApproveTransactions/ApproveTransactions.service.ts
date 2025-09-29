import { useMutation } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { ApproveTransactionsApiRequest } from 'libs/api-connectors/backend-connector-reeve/api/transactions/transactionsApi.types.ts'

const approveTransactionsQuery = async (request: ApproveTransactionsApiRequest) => {
  const { transactionsApi } = backendReeveApi()

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
