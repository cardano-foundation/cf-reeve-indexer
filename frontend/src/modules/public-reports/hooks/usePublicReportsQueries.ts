import { FormikProps } from 'formik'
import { useGetPublicReportsModel } from 'libs/models/reports-model/GetReportsModel/GetPublicReports.service.ts'
import { getSearchReportPayload } from 'modules/public-reports/utils/payload.ts'
import { PublicReportsFiltersFormValues } from 'modules/public-reports/components/Filters/Filters.types.ts'
import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext'

interface PublicReportsQueriesState {
  formik: FormikProps<PublicReportsFiltersFormValues>
}

export const usePublicReportsQueries = (state: PublicReportsQueriesState) => {
  const { formik } = state

  const { values } = formik
  const { selectedOrganisation } = useLayoutPublicContext()

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
