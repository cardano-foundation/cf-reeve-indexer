import { useGetPublicReportsModel } from 'libs/models/reports-model/GetReportsModel/GetPublicReports.service.ts'
import { ReportsFiltersValues } from 'modules/public-reports/components/ReportsFilters/ReportsFilters.types'
import { ReportsQuickFiltersValues } from 'modules/public-reports/components/ReportsToolbar/ReportsToolbar.types'
import { mapSearchFiltersToRequestBody } from 'modules/public-reports/utils/payload'

interface PublicReportsQueriesState {
  filters: ReportsQuickFiltersValues & ReportsFiltersValues
  pagination: { page: number; size: number }
  sorting: { sortBy: string; sortOrder: 'asc' | 'desc' | null | undefined }
}

export const usePublicReportsQueries = (state: PublicReportsQueriesState) => {
  const {
    filters,
    pagination: { page, size },
    sorting: { sortBy, sortOrder }
  } = state

  const selectedOrganisation = '75f95560c1d883ee7628993da5adf725a5d97a13929fd4f477be0faf5020ca94'

  const filtersPayload = mapSearchFiltersToRequestBody(filters)

  const hasSomeFilters = Object.values(filtersPayload).some((value) => Boolean(value))

  const { reports, isFetching } = useGetPublicReportsModel(
    {
      parameters: {
        page,
        size,
        sort: [`${sortBy},${sortOrder}`]
      },
      body: {
        organisationId: selectedOrganisation,
        ...(hasSomeFilters ? filtersPayload : {})
      }
    },
    [filters, page, size, sortBy, sortOrder]
  )

  return {
    reports,
    isFetching
  }
}
