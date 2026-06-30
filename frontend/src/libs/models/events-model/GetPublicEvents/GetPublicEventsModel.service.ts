import { useQuery, keepPreviousData } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { PostPublicEventsRequest } from 'libs/api-connectors/backend-connector-reeve/api/events/publicEventsApi.types.ts'

const getPublicEventsQuery = async (request: PostPublicEventsRequest) => {
  const { eventsApi } = backendReeveApi()

  const data = await eventsApi.getEvents(request)

  if (!data) return null

  return data
}

export const useGetPublicEventsModel = (request: PostPublicEventsRequest, dependencies: unknown[] = [], isEnabled: boolean = true) => {
  const { data, isFetching } = useQuery({
    queryKey: ['PUBLIC_EVENTS', ...dependencies],
    queryFn: () => getPublicEventsQuery(request),
    enabled: isEnabled,
    retry: false,
    placeholderData: keepPreviousData
  })

  return {
    events: data ?? null,
    isEventsFetching: isFetching
  }
}
