import { useQuery } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'

const getChartOfAccountsQuery = async (orgnaisationId: string) => {
  const { chartOfAccountsApi } = backendLobApi()

  const data = await chartOfAccountsApi.getChartOfAccounts(orgnaisationId)

  if (!data) return null

  return data
}

export const useGetChartOfAccountsModel = (orgnaisationId: string) => {
  const { data, isFetching } = useQuery({ queryKey: ['CHART_OF_ACCOUNT'], queryFn: () => getChartOfAccountsQuery(orgnaisationId) })

  return {
    chartOfAccounts: data ?? [],
    isFetching
  }
}
