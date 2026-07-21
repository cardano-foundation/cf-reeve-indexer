import { useQuery, keepPreviousData } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { GetEventAuditRequest } from 'libs/api-connectors/backend-connector-reeve/api/events/publicEventsApi.types.ts'

const getEventAuditQuery = async (request: GetEventAuditRequest) => {
  const { eventsApi } = backendReeveApi()

  const data = await eventsApi.getEventAudit(request)

  if (!data) return null

  return data
}

export const useGetEventAuditModel = (request: GetEventAuditRequest, dependencies: unknown[] = [], isEnabled: boolean = true) => {
  const { data, isFetching } = useQuery({
    queryKey: ['EVENT_AUDIT', ...dependencies],
    queryFn: () => getEventAuditQuery(request),
    enabled: isEnabled,
    retry: false,
    placeholderData: keepPreviousData
  })

  return {
    audit: data ?? null,
    isAuditFetching: isFetching
  }
}
