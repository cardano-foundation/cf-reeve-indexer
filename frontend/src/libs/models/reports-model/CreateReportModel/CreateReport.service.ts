import { useMutation } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'
import { CreateReportRequest } from 'libs/api-connectors/backend-connector-lob/api/reports/publicReports.types'

const createReportQuery = async (parameters: CreateReportRequest) => {
  const { reportsApi } = backendLobApi()

  const data = await reportsApi.createReport({ ...parameters })

  if (!data) return null

  return data
}

export const useCreateReportModel = () => {
  const { data, mutateAsync } = useMutation({ mutationKey: ['CREATE_REPORT'], mutationFn: createReportQuery })

  return {
    createdReport: data ?? null,
    triggerCreateReport: mutateAsync
  }
}
