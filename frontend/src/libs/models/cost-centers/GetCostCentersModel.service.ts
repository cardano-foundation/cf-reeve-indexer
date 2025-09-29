import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'

const getCostCentersQuery = async (orgnaisationId: string) => {
  const { costCentersApi } = backendReeveApi()

  const data = await costCentersApi.getCostCenters(orgnaisationId)

  if (!data) return null

  return data
}

export const useGetCostCentersModel = (orgnaisationId: string) => {
  const { data, isFetching } = useQuery({ queryKey: ['COST_CENTERS'], queryFn: () => getCostCentersQuery(orgnaisationId) })

  return {
    costCenters: data ?? [],
    isFetching
  }
}
