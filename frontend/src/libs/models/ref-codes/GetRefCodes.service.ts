import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'

const getRefCodesQuery = async (organisationId: string) => {
  const { refCodesApi } = backendReeveApi()

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
