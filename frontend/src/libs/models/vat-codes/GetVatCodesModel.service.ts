import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'

const getVatCodesQuery = async (orgnaisationId: string) => {
  const { vatCodesApi } = backendReeveApi()

  const data = await vatCodesApi.getVatCodes(orgnaisationId)

  if (!data) return null

  return data
}

export const useGetVatCodesModel = (orgnaisationId: string) => {
  const { data, isFetching } = useQuery({ queryKey: ['VAT_CODES'], queryFn: () => getVatCodesQuery(orgnaisationId) })

  return {
    vatCodes: data ?? [],
    isVatCodesFetching: isFetching
  }
}
