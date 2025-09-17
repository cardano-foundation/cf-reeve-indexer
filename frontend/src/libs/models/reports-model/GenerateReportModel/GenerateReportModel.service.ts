import { useQuery } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'
import { GenerateReportRequest } from 'libs/api-connectors/backend-connector-lob/api/reports/publicReports.types'

const generateReportQuery = async (parameters: GenerateReportRequest) => {
  const { reportsApi } = backendLobApi()

  const data = await reportsApi.generateReport({ ...parameters })

  if (!data) return null

  return data
}

export const useGenerateReportModel = (parameters: GenerateReportRequest, isEnabled: boolean = true) => {
  const { data, refetch, isFetching } = useQuery({
    queryKey: ['GENERATE_REPORT', parameters],
    queryFn: () => generateReportQuery({ ...parameters }),
    retry: false,
    enabled: isEnabled
  })

  return {
    generatedReport: data ?? null,
    triggerGenerateReport: refetch,
    isGenerateReportFetching: isFetching
  }
}
