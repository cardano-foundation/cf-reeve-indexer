import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'

const getOrganisationQuery = async ({ id }: { id: string }) => {
  const { organisationApi } = backendReeveApi()

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
