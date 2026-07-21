import { useMemo } from 'react'

import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext'
import { useGetPublicEventsModel } from 'libs/models/events-model/GetPublicEvents/GetPublicEventsModel.service.ts'
import { SearchFiltersValues } from 'modules/public-events/components/SearchFilters/SearchFilters.types'
import { SearchQuickFiltersValues } from 'modules/public-events/components/SearchToolbar/SearchToolbar.types'
import { mapSearchFiltersToRequestBody, mapSearchSortToRequestParameters } from 'modules/public-events/utils/payload.ts'

interface PublicEventsQueriesState {
  filters: SearchQuickFiltersValues & SearchFiltersValues
  pagination: { page: number; size: number }
  sorting: { sortBy: string; sortOrder: 'asc' | 'desc' | null | undefined }
}

export const usePublicEventsQueries = (state: PublicEventsQueriesState) => {
  const {
    filters,
    pagination: { page, size },
    sorting: { sortBy, sortOrder }
  } = state

  const { selectedOrganisation } = useLayoutPublicContext()

  const filtersPayload = useMemo(() => mapSearchFiltersToRequestBody(filters), [filters])

  const hasSomeFilters = Object.values(filtersPayload).some((value) => Boolean(value))

  const { events, isEventsFetching } = useGetPublicEventsModel(
    {
      parameters: { page, size, sort: mapSearchSortToRequestParameters(sortBy, sortOrder) },
      body: {
        organisationId: selectedOrganisation,
        ...(hasSomeFilters ? filtersPayload : {})
      }
    },
    [selectedOrganisation, filters, page, size, sortBy, sortOrder],
    Boolean(selectedOrganisation)
  )

  const isFetching = isEventsFetching

  return { events, isFetching }
}
