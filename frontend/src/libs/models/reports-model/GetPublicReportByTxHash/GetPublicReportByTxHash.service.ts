import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { GetPublicReportByTxHashRequest } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types'

const getPublicReportByTxHashQuery = async (request: GetPublicReportByTxHashRequest) => {
  const { reportsApi } = backendReeveApi()

  const data = await reportsApi.getReportByTxHash(request)

  if (!data) return null

  return data.reports[0] ?? null
}

export const useGetPublicReportByTxHashModel = (request: GetPublicReportByTxHashRequest, isEnabled: boolean = true) => {
  const { data, isFetching, isFetched, isError } = useQuery({
    queryKey: ['PUBLIC_REPORT_BY_TX_HASH', request.organisationId, request.txHash],
    queryFn: () => getPublicReportByTxHashQuery(request),
    enabled: isEnabled,
    retry: false,
    refetchOnWindowFocus: false
  })

  return {
    report: data ?? null,
    isFetching,
    isFetched,
    isError
  }
}
