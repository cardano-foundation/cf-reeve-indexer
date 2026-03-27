import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { GetOrganisationProjectsRequest } from 'libs/api-connectors/backend-connector-reeve/api/organisation/organisationApi.types'

const getOrganisationProjectsQuery = async (request: GetOrganisationProjectsRequest) => {
  const { organisationApi } = backendReeveApi()

  const data = await organisationApi.getOrganisationProjects(request)

  if (!data) return null

  return data
}

export const useGetOrganisationProjectsModel = (request: GetOrganisationProjectsRequest, isEnabled: boolean = true) => {
  const { data, isFetching } = useQuery({
    queryKey: ['ORGANISATION_PROJECTS', request.parameters.organisationId],
    queryFn: () => getOrganisationProjectsQuery(request),
    enabled: isEnabled
  })

  return {
    projects: data ?? null,
    isProjectsFetching: isFetching
  }
}
