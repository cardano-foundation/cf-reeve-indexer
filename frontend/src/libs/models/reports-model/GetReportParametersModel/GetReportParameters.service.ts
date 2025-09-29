import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { GetReportParametersRequest } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types'

const getReportParametersQuery = async (parameters: GetReportParametersRequest) => {
  const { reportsApi } = backendReeveApi()

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
