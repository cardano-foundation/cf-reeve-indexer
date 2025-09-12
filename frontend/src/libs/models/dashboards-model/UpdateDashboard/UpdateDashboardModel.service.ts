import { useMutation } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'
import { UpdateDashboardRequest } from 'libs/api-connectors/backend-connector-lob/api/dashboards/dashboardsApi.types.ts'

const updateDashboardQuery = async (request: UpdateDashboardRequest) => {
  const { dashboardsApi } = backendLobApi()

  const data = await dashboardsApi.updateDashboard(request)

  if (!data) return null

  return data
}

export const useUpdateDashboardModel = () => {
  const { mutateAsync, status } = useMutation({ mutationKey: ['UPDATE_DASHBOARD'], mutationFn: updateDashboardQuery })

  return {
    triggerUpdateDashboard: mutateAsync,
    status
  }
}
