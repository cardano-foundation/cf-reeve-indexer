import { useMutation } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'
import { PostChartOfAccountRequest } from 'libs/api-connectors/backend-connector-lob/api/chart-of-accounts/chartOfAccountsApi.types.ts'

const updateChartOfAccountQuery = async (payload: Partial<PostChartOfAccountRequest>) => {
  const { chartOfAccountsApi } = backendLobApi()

  const data = await chartOfAccountsApi.updateChartOfAccounts(payload)

  if (!data) return null

  return data
}

export const useUpdateChartOfAccountModel = () => {
  const { data, mutateAsync } = useMutation({ mutationKey: ['UPDATE_CHART_OF_ACCOUNT'], mutationFn: updateChartOfAccountQuery })

  return {
    updatedChartOfAccount: data ?? null,
    triggerUpdateChartOfAccount: mutateAsync
  }
}
