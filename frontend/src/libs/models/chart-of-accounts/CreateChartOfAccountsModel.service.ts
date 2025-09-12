import { useMutation } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'
import { PostChartOfAccountRequest } from 'libs/api-connectors/backend-connector-lob/api/chart-of-accounts/chartOfAccountsApi.types.ts'

const createChartOfAccountQuery = async (payload: Partial<PostChartOfAccountRequest>) => {
  const { chartOfAccountsApi } = backendLobApi()

  const data = await chartOfAccountsApi.createChartOfAccounts(payload)

  if (!data) return null

  return data
}

export const useCreateChartOfAccountModel = () => {
  const { data, mutateAsync } = useMutation({ mutationKey: ['CREATE_CHART_OF_ACCOUNT'], mutationFn: createChartOfAccountQuery })

  return {
    createdChartOfAccount: data ?? null,
    triggerCreateChartOfAccount: mutateAsync
  }
}
