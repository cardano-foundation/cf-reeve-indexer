import { useQuery } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'

const getVatCodesQuery = async (orgnaisationId: string) => {
  const { vatCodesApi } = backendLobApi()

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
