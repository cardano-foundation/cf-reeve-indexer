import { useMutation } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { SaveDashboardRequest } from 'libs/api-connectors/backend-connector-reeve/api/dashboards/dashboardsApi.types.ts'

const saveDashboardQuery = async (request: SaveDashboardRequest) => {
  const { dashboardsApi } = backendReeveApi()

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
