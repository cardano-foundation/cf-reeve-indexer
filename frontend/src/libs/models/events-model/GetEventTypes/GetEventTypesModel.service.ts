import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { GetEventTypesRequest } from 'libs/api-connectors/backend-connector-reeve/api/events/publicEventsApi.types'

const getEventTypesQuery = async (request: GetEventTypesRequest) => {
  const { eventsApi } = backendReeveApi()

  const data = await eventsApi.getEventTypes(request)

  if (!data) return null

  return data
}

export const useGetEventTypesModel = (request: GetEventTypesRequest, isEnabled: boolean = true) => {
  const { data, isFetching } = useQuery({
    queryKey: ['EVENT_TYPES', request.parameters.organisationId],
    queryFn: () => getEventTypesQuery(request),
    enabled: isEnabled
  })

  return {
    eventTypes: data ?? null,
    isEventTypesFetching: isFetching
  }
}
