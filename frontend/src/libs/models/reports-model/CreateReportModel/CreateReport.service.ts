import { useMutation } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { CreateReportRequest } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types'

const createReportQuery = async (parameters: CreateReportRequest) => {
  const { reportsApi } = backendReeveApi()

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
