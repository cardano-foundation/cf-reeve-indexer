import { useMutation } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { PublishReportRequest } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types'

const publishReportQuery = async (parameters: PublishReportRequest) => {
  const { reportsApi } = backendReeveApi()

  const data = await reportsApi.publishReport(parameters)

  if (!data) return null

  return data
}

export const usePublishReportModel = () => {
  const { data, mutateAsync } = useMutation({ mutationKey: ['PUBLISH_REPORT'], mutationFn: publishReportQuery })

  return {
    publishedReport: data ?? null,
    triggerPublishReport: mutateAsync
  }
}
