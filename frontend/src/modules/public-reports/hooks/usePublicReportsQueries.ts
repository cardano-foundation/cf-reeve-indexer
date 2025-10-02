import { FormikProps } from 'formik'
import { useGetPublicReportsModel } from 'libs/models/reports-model/GetReportsModel/GetPublicReports.service.ts'
import { getSearchReportPayload } from 'modules/public-reports/utils/payload.ts'
import { PublicReportsFiltersFormValues } from 'modules/public-reports/components/Filters/Filters.types.ts'

interface PublicReportsQueriesState {
  formik: FormikProps<PublicReportsFiltersFormValues>
}

export const usePublicReportsQueries = (state: PublicReportsQueriesState) => {
  const { formik } = state

  const { values } = formik

  const selectedOrganisation = '75f95560c1d883ee7628993da5adf725a5d97a13929fd4f477be0faf5020ca94' // TODO - make dynamic when multi-org is supported

  const { reports, isFetching } = useGetPublicReportsModel({
    ...(values?.period ? getSearchReportPayload(values.period) : {}),
    ...(values?.report && { reportType: values.report }),
    organisationId: selectedOrganisation,
  });

  return {
    reports: reports?.reports ?? [],
    isFetching
  }
}
