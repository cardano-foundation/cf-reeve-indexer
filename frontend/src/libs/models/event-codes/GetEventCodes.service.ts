import { useQuery } from '@tanstack/react-query'

import { backendLobApi } from 'libs/api-connectors/backend-connector-lob/api/backendLobApi.ts'

const getEventCodesQuery = async (organisationId: string) => {
  const { eventCodesApi } = backendLobApi()

  const data = await eventCodesApi.getEventCodes(organisationId)

  if (!data) return null

  return data
}

export const useGetEventCodesModel = (organisationId: string) => {
  const { data, isFetching } = useQuery({ queryKey: ['EVENT_CODES', organisationId], queryFn: () => getEventCodesQuery(organisationId) })

  return {
    eventCodes: data ?? null,
    isFetching
  }
}
