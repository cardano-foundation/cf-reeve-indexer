import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'

const getChartOfAccountsQuery = async (orgnaisationId: string) => {
  const { chartOfAccountsApi } = backendReeveApi()

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
