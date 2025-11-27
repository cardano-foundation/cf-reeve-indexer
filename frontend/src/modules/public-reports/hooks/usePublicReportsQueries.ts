import { useGetPublicReportsModel } from 'libs/models/reports-model/GetReportsModel/GetPublicReports.service.ts'
<<<<<<< HEAD
import { getSearchReportPayload } from 'modules/public-reports/utils/payload.ts'
import { PublicReportsFiltersFormValues } from 'modules/public-reports/components/Filters/Filters.types.ts'
import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext'
=======
import { ReportsFiltersValues } from 'modules/public-reports/components/ReportsFilters/ReportsFilters.types'
import { ReportsQuickFiltersValues } from 'modules/public-reports/components/ReportsToolbar/ReportsToolbar.types'
import { mapSearchFiltersToRequestBody } from 'modules/public-reports/utils/payload'
>>>>>>> main

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

<<<<<<< HEAD
  const { values } = formik
  const { selectedOrganisation } = useLayoutPublicContext()

  const { reports, isFetching } = useGetPublicReportsModel({
    ...(values?.period ? getSearchReportPayload(values.period) : {}),
    ...(values?.report && { reportType: values.report }),
    organisationId: selectedOrganisation,
  });
  
=======
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

>>>>>>> main
  return {
    reports,
    isFetching
  }
}
