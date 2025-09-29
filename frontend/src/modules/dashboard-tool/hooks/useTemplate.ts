import { useCallback, useEffect, useState } from 'react'

import { GetDashboardsResponse } from 'libs/api-connectors/backend-connector-reeve/api/dashboards/dashboardsApi.types.ts'
import { Template } from 'modules/dashboard-tool/types'

interface TemplateState {
  dashboard: GetDashboardsResponse | null
}

export const useTemplate = (state: TemplateState) => {
  const { dashboard } = state

  const [template, setTemplate] = useState<Template>(Template.ONE)

  const handleTemplate = useCallback(
    (template: Template) => {
      setTemplate(template)
    },
    [setTemplate]
  )

  useEffect(() => {
    if (dashboard) {
      const template = dashboard.name

      handleTemplate(template)
    }
  }, [dashboard, handleTemplate])

  return {
    template,
    handleTemplate
  }
}
