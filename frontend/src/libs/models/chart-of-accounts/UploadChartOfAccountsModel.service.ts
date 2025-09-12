import { useMutation } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'
import { UploadChartOfAccountsRequest } from 'libs/api-connectors/backend-connector-lob/api/chart-of-accounts/chartOfAccountsApi.types'

const uploadChartOfAccountsQuery = async (payload: UploadChartOfAccountsRequest) => {
  const { chartOfAccountsApi } = backendLobApi()

  const data = await chartOfAccountsApi.uploadChartOfAccounts(payload)

  if (!data) return null

  return data
}

export const useUploadChartOfAccountsModel = () => {
  const { data, mutateAsync } = useMutation({ mutationKey: ['UPLOAD_CHART_OF_ACCOUNTS'], mutationFn: uploadChartOfAccountsQuery })

  return {
    uploadedChartOfAccounts: data ?? null,
    triggerUploadChartOfAccounts: mutateAsync
  }
}
