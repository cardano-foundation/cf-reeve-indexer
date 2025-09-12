import { useNavigate } from 'react-router-dom'

import { GetDashboardsResponse } from 'libs/api-connectors/backend-connector-lob/api/dashboards/dashboardsApi.types.ts'
import { GetAvailableMetricsResponse200 } from 'libs/api-connectors/backend-connector-lob/api/metrics/metricsApi.types.ts'
import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation'
import { useSaveDashboardModel } from 'libs/models/dashboards-model/SaveDashboard/SaveDashboardModel.service.ts'
import { useUpdateDashboardModel } from 'libs/models/dashboards-model/UpdateDashboard/UpdateDashboardModel.service.ts'
import { useDialogAlert } from 'libs/ui-kit/components/DialogAlert/useDialogAlert.ts'
import { Slots, Template, TemplateSlotSelections } from 'modules/dashboard-builder/types'
import { getPayload } from 'modules/dashboard-builder/utils/payload.ts'
import { PATHS } from 'routes'

interface DashboardBuilderDialogTemplateSaveState {
  availableMetrics: GetAvailableMetricsResponse200 | null
  dashboard: GetDashboardsResponse | null
  template: Template
  selection: TemplateSlotSelections<Slots>
}

export const useDashboardBuilderDialogTemplateSave = (state: DashboardBuilderDialogTemplateSaveState) => {
  const { availableMetrics, dashboard, template, selection } = state

  const selectedOrganisation = useSelectedOrganisation()

  const { triggerSaveDashboard } = useSaveDashboardModel()
  const { triggerUpdateDashboard } = useUpdateDashboardModel()

  const navigate = useNavigate()

  const { isOpen, handleDialogClose, handleDialogOpen } = useDialogAlert()

  const handleDialogCancel = () => {
    handleDialogClose()
  }

  const handleDialogConfirm = async () => {
    const payload = getPayload(availableMetrics, selection, template)

    !dashboard
      ? await triggerSaveDashboard(
          { organisationId: selectedOrganisation, dashboards: [payload] },
          { onSuccess: () => navigate(PATHS.DATA_EXPLORER_DASHBOARD, { state: { hasDashboardCreated: true } }) }
        )
      : await triggerUpdateDashboard(
          { organisationId: selectedOrganisation, dashboard: { ...payload, id: dashboard.id } },
          { onSuccess: () => navigate(PATHS.DATA_EXPLORER_DASHBOARD, { state: { hasDashboardCreated: true } }) }
        )
  }

  return {
    isDialogTemplateSaveOpen: isOpen,
    handleDialogTemplateSaveCancel: handleDialogCancel,
    handleDialogTemplateSaveConfirm: handleDialogConfirm,
    handleDialogTemplateSaveOpen: handleDialogOpen
  }
}
