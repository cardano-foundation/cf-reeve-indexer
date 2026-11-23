import { useMutation } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { GetPublicReportDownloadRequest } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types.ts'

const downloadPublicReportQuery = async (request: GetPublicReportDownloadRequest) => {
  const { reportsApi } = backendReeveApi()

  const data = await reportsApi.downloadReport(request)

  if (!data) return null

  return data
}

export const useDownloadPublicReportModel = () => {
  const { mutateAsync, isPending } = useMutation({ mutationKey: ['DOWNLOAD_PUBLIC_REPORT'], mutationFn: downloadPublicReportQuery })

  return {
    triggerDownloadReport: mutateAsync,
    isDownloadPending: isPending
  }
}
