import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import { GetOrganisationEventsRequest } from 'libs/api-connectors/backend-connector-reeve/api/organisation/organisationApi.types'

const getOrganisationEventsQuery = async (request: GetOrganisationEventsRequest) => {
  const { organisationApi } = backendReeveApi()

  const data = await organisationApi.getOrganisationEvents(request)

  if (!data) return null

  return data
}

export const useGetOrganisationEventsModel = (request: GetOrganisationEventsRequest) => {
  const { data, isFetching } = useQuery({ queryKey: ['ORGANISATION_EVENTS'], queryFn: () => getOrganisationEventsQuery(request) })

  return {
    events: data ?? null,
    isEventsFetching: isFetching
  }
}
