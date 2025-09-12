import { useQuery } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'

const getOrganisationsQuery = async ({ hasAuthorizationHeader }: { hasAuthorizationHeader?: boolean }) => {
  const { organisationApi } = backendLobApi()

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
