import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation.tsx'
import { useGenerateReportModel } from 'libs/models/reports-model/GenerateReportModel/GenerateReportModel.service.ts'
import { useGetReportParametersModel } from 'libs/models/reports-model/GetReportParametersModel/GetReportParameters.service.ts'
import { useSearchReportModel } from 'libs/models/reports-model/SearchReportModel/SearchReport.service.ts'
import { ReportParametersFormValues } from 'modules/report-parameters/components/ReportParametersForm/ReportParametersForm.types.ts'
import { getSearchReportPayload } from 'modules/report-parameters/utils/payload.ts'

interface ReportParamatersQueriesState {
  values: ReportParametersFormValues
  areParametersSelected: boolean
}

export const useReportParametersQueries = (state: ReportParamatersQueriesState) => {
  const { values, areParametersSelected } = state

  const selectedOrganisation = useSelectedOrganisation()

  const { reportParameters, isFetching } = useGetReportParametersModel({ organisationId: selectedOrganisation })
  const { searchedReport, isSearchReportFetching } = useSearchReportModel(
    { organisationId: selectedOrganisation, reportType: values?.report, ...(values?.period ? getSearchReportPayload(values.period) : {}) },
    areParametersSelected
  )
  const { generatedReport, isGenerateReportFetching } = useGenerateReportModel(
    { organisationId: selectedOrganisation, reportType: values?.report, ...(values?.period ? getSearchReportPayload(values.period) : {}), preview: true },
    areParametersSelected
  )

  const [existingReport] = searchedReport?.report ?? []
  const [previewReport] = generatedReport?.report ?? []

  const hasNonPublishedReportForThePeriod = Boolean(existingReport) && !existingReport?.publish
  const hasPublishedReportForThePeriod = Boolean(existingReport) && existingReport?.publish

  return {
    existingReport,
    previewReport,
    reportParameters,
    hasNonPublishedReportForThePeriod,
    hasPublishedReportForThePeriod,
    isReportParametersFetching: isFetching,
    isGenerateReportFetching,
    isSearchReportFetching
  }
}
