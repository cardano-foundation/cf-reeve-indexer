import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { GetEventsByTxRequest } from 'libs/api-connectors/backend-connector-reeve/api/events/publicEventsApi.types.ts'

const getEventsByTxQuery = async (request: GetEventsByTxRequest) => {
  const { eventsApi } = backendReeveApi()

  const data = await eventsApi.getEventsByTx(request)

  if (!data) return null

  return data
}

export const useGetEventsByTxModel = (request: GetEventsByTxRequest, dependencies: unknown[] = [], isEnabled: boolean = true) => {
  const { data, isFetching } = useQuery({
    queryKey: ['EVENTS_BY_TX', ...dependencies],
    queryFn: () => getEventsByTxQuery(request),
    enabled: isEnabled,
    retry: false
  })

  return {
    eventsByTx: data ?? null,
    isEventsByTxFetching: isFetching
  }
}
