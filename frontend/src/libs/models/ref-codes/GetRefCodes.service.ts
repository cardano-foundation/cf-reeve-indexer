import { useQuery } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'

const getRefCodesQuery = async (organisationId: string) => {
  const { refCodesApi } = backendLobApi()

  const data = await refCodesApi.getRefCodes(organisationId)

  if (!data) return null

  return data
}

export const useGetRefCodesModel = (organisationId: string) => {
  const { data, isFetching } = useQuery({ queryKey: ['REF_CODES', organisationId], queryFn: () => getRefCodesQuery(organisationId) })

  return {
    refCodes: data ?? [],
    isFetching
  }
}
