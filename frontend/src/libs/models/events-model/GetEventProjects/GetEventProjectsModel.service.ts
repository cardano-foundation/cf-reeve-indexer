import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { GetEventProjectsRequest } from 'libs/api-connectors/backend-connector-reeve/api/events/publicEventsApi.types'

const getEventProjectsQuery = async (request: GetEventProjectsRequest) => {
  const { eventsApi } = backendReeveApi()

  const data = await eventsApi.getEventProjects(request)

  if (!data) return null

  return data
}

export const useGetEventProjectsModel = (request: GetEventProjectsRequest, isEnabled: boolean = true) => {
  const { data, isFetching } = useQuery({
    queryKey: ['EVENT_PROJECTS', request.parameters.organisationId],
    queryFn: () => getEventProjectsQuery(request),
    enabled: isEnabled
  })

  return {
    projects: data ?? null,
    isProjectsFetching: isFetching
  }
}
