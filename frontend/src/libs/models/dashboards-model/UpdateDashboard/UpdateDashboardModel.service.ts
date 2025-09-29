import { useMutation } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { UpdateDashboardRequest } from 'libs/api-connectors/backend-connector-reeve/api/dashboards/dashboardsApi.types.ts'

const updateDashboardQuery = async (request: UpdateDashboardRequest) => {
  const { dashboardsApi } = backendReeveApi()

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
