import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'

const getOrganisationsLastUpdatedQuery = async () => {
  const { organisationApi } = backendReeveApi()

  const data = await organisationApi.getOrganisationsLastUpdated()

  if (!data) return null

  return data
}

export const useGetOrganisationsLastUpdatedModel = () => {
  const { data, isFetching, isError, isPending } = useQuery({ queryKey: ['ORGANISATIONS_LAST_UPDATED'], queryFn: getOrganisationsLastUpdatedQuery })

  return {
    organisationsLastUpdated: data ?? null,
    isFetching,
    isError,
    isPending
  }
}
