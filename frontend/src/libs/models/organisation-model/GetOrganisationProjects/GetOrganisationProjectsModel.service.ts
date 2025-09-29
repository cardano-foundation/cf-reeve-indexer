import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'

const getOrganisationProjectsQuery = async ({ id }: { id: string }) => {
  const { organisationApi } = backendReeveApi()

  const data = await organisationApi.getOrganisationProjects({ id })

  if (!data) return null

  return data
}

export const useGetOrganisationProjectsModel = ({ id }: { id: string }) => {
  const { data, isFetching } = useQuery({ queryKey: ['ORGANISATION_PROJECTS'], queryFn: () => getOrganisationProjectsQuery({ id }) })

  return {
    organisationProjects: data ?? null,
    isOrganisationProjectsFetching: isFetching
  }
}
