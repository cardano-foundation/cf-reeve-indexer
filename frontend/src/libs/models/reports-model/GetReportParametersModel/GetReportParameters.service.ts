import { useQuery } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'
import { GetReportParametersRequest } from 'libs/api-connectors/backend-connector-lob/api/reports/publicReports.types'

const getReportParametersQuery = async (parameters: GetReportParametersRequest) => {
  const { reportsApi } = backendLobApi()

  const data = await reportsApi.getReportParameters({ ...parameters })

  if (!data) return null

  return data
}

export const useGetReportParametersModel = (parameters: GetReportParametersRequest) => {
  const { data, isFetching } = useQuery({
    queryKey: ['REPORT_PARAMETERS'],
    queryFn: () => getReportParametersQuery({ ...parameters })
  })

  return {
    reportParameters: data ?? null,
    isFetching
  }
}
