import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'

const getOrganisationsQuery = async ({ hasAuthorizationHeader }: { hasAuthorizationHeader?: boolean }) => {
  const { organisationApi } = backendReeveApi()

  const data = await organisationApi.getOrganisations({ hasAuthorizationHeader })

  if (!data) return null

  return data
}

export const useGetOrganisationsModel = ({ hasAuthorizationHeader }: { hasAuthorizationHeader?: boolean } = {}) => {
  const { data, isFetching } = useQuery({ queryKey: ['ORGANISATIONS'], queryFn: () => getOrganisationsQuery({ hasAuthorizationHeader }) })

  return {
    organisations: data ?? null,
    isFetching
  }
}
