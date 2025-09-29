import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { GenerateReportRequest } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types'

const generateReportQuery = async (parameters: GenerateReportRequest) => {
  const { reportsApi } = backendReeveApi()

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
