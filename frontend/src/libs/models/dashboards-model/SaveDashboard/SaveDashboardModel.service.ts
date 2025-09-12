import { useMutation } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'
import { SaveDashboardRequest } from 'libs/api-connectors/backend-connector-lob/api/dashboards/dashboardsApi.types.ts'

const saveDashboardQuery = async (request: SaveDashboardRequest) => {
  const { dashboardsApi } = backendLobApi()

  const data = await dashboardsApi.saveDashboard(request)

  if (!data) return null

  return data
}

export const useSaveDashboardModel = () => {
  const { mutateAsync, status } = useMutation({ mutationKey: ['SAVE_DASHBOARD'], mutationFn: saveDashboardQuery })

  return {
    triggerSaveDashboard: mutateAsync,
    status
  }
}
