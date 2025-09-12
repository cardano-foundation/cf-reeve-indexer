import { FormikProps } from 'formik'

import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation.tsx'
import { useGetPublicReportsModel } from 'libs/models/reports-model/GetReportsModel/GetPublicReports.service.ts'
import { getSearchReportPayload } from 'modules/report-parameters/utils/payload.ts'
import { PublicReportsFiltersFormValues } from 'modules/reports-public/components/Filters/Filters.types.ts'

interface PublicReportsQueriesState {
  formik: FormikProps<PublicReportsFiltersFormValues>
}

export const usePublicReportsQueries = (state: PublicReportsQueriesState) => {
  const { formik } = state

  const { values } = formik

  const selectedOrganisation = useSelectedOrganisation()

  const { reports, isFetching } = useGetPublicReportsModel({
    ...(values?.period ? getSearchReportPayload(values.period) : {}),
    reportType: values?.report,
    organisationId: selectedOrganisation
  })

  return {
    reports: reports?.report ?? [],
    isFetching
  }
}
