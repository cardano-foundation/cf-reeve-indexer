import { GetDashboardsResponse } from 'libs/api-connectors/backend-connector-reeve/api/dashboards/dashboardsApi.types.ts'
import { GetAvailableMetricsResponse200 } from 'libs/api-connectors/backend-connector-reeve/api/metrics/metricsApi.types.ts'
import { Slots, Template, TemplateSlotSelections } from 'modules/dashboard-tool/types'

export const getPayload = (availableMetrics: GetAvailableMetricsResponse200 | null, selection: TemplateSlotSelections<Slots>, template: Template) => {
  const payload: Omit<GetDashboardsResponse, 'id'> = {
    name: template,
    description: '',
    charts: Object.values(selection)
      .filter((value) => value !== null)
      .map((submetric) => {
        const metric = Object.entries(availableMetrics?.metrics ?? {}).find(([_, submetrics]) => submetrics.includes(submetric))?.[0]

        return {
          width: 0,
          height: 0,
          metric,
          subMetric: submetric,
          ypos: 0,
          xpos: 0
        }
      })
  }

  return payload
}
