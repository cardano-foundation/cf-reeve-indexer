import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'

const getEventCodesQuery = async (organisationId: string) => {
  const { eventCodesApi } = backendReeveApi()

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
