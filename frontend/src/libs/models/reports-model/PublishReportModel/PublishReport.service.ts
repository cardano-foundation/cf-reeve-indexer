import { useMutation } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'
import { PublishReportRequest } from 'libs/api-connectors/backend-connector-lob/api/reports/reportsApi.types.ts'

const publishReportQuery = async (parameters: PublishReportRequest) => {
  const { reportsApi } = backendLobApi()

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
