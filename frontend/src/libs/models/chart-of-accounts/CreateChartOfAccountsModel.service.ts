import { useMutation } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { PostChartOfAccountRequest } from 'libs/api-connectors/backend-connector-reeve/api/chart-of-accounts/chartOfAccountsApi.types.ts'

const createChartOfAccountQuery = async (payload: Partial<PostChartOfAccountRequest>) => {
  const { chartOfAccountsApi } = backendReeveApi()

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
