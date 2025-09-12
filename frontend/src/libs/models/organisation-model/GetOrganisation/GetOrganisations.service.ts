import { useQuery } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'

const getOrganisationQuery = async ({ id }: { id: string }) => {
  const { organisationApi } = backendLobApi()

  const data = await organisationApi.getOrganisation({ id })

  if (!data) return null

  return data
}

export const useGetOrganisationModel = ({ id }: { id: string }) => {
  const { data, isFetching } = useQuery({ queryKey: ['ORGANISATION'], queryFn: () => getOrganisationQuery({ id }), enabled: Boolean(id) })

  return {
    organisation: data ?? null,
    isFetching
  }
}
