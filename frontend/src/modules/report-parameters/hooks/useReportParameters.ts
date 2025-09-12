import { useNavigate } from 'react-router-dom'

import { useLocationState } from 'hooks'
import { ReportType } from 'libs/api-connectors/backend-connector-lob/api/reports/reportsApi.types.ts'
import { getReportCurrencyOptions } from 'modules/report-parameters/components/ReportParametersForm/ReportParametersForm.utils.ts'
import { useDialogNonPublishedReport, useDialogPublishedReport } from 'modules/report-parameters/hooks/useDialogReport.ts'
import { useReportParametersForm } from 'modules/report-parameters/hooks/useReportParametersForm.ts'
import { useReportParametersQueries } from 'modules/report-parameters/hooks/useReportParametersQueries.ts'
import { useModalReport } from 'modules/reporting/components'

export interface ReportTypeLocationState {
  currency: string
  period: string
  reportType: ReportType
  isAutomaticGeneration?: boolean
}

export const useReportParameters = () => {
  const navigate = useNavigate()

  const { state } = useLocationState<ReportTypeLocationState>()

  const { formik, areParametersSelected } = useReportParametersForm({ locationState: state })

  const {
    existingReport,
    previewReport,
    reportParameters,
    hasNonPublishedReportForThePeriod,
    hasPublishedReportForThePeriod,
    isReportParametersFetching,
    isGenerateReportFetching,
    isSearchReportFetching
  } = useReportParametersQueries({ values: formik.values, areParametersSelected })

  const handleReportTypeRedirect = () => {
    const type = formik.values.report?.toLowerCase().replace('_', '-')

    const currencies = getReportCurrencyOptions(reportParameters?.currencyType)

    const state = {
      currency: currencies.find(({ value }) => value === formik.values.currency),
      period: formik.values.period,
      isAutomaticGeneration: formik.values.isAutomaticGeneration
    }

    navigate({ pathname: `/secure/reporting/report/${type}` }, { state })
  }

  const { isDialogNonPublishedReportOpen, handleDialogNonPublishedReportCancel, handleDialogNonPublishedReportConfirm, handleDialogNonPublishedReportOpen } =
    useDialogNonPublishedReport({ values: formik.values }, { onReportTypeRedirect: handleReportTypeRedirect })

  const { isDialogPublishedReportOpen, handleDialogPublishedReportCancel, handleDialogPublishedReportConfirm, handleDialogPublishedReportOpen } = useDialogPublishedReport(
    { values: formik.values },
    { onReportTypeRedirect: handleReportTypeRedirect }
  )

  const { handleModalReportClose, handleModalReportOpen, isModalReportOpen } = useModalReport()

  const handleContinue = () => {
    hasPublishedReportForThePeriod ? handleDialogPublishedReportOpen() : hasNonPublishedReportForThePeriod ? handleDialogNonPublishedReportOpen() : handleReportTypeRedirect()
  }

  const isContinueDisabled = !areParametersSelected && !isSearchReportFetching
  const isPreviewDisabled = !areParametersSelected && !isGenerateReportFetching

  return {
    formik,
    existingReport,
    previewReport,
    reportParameters,
    handleContinue,
    handleDialogNonPublishedReportCancel,
    handleDialogNonPublishedReportConfirm,
    handleDialogPublishedReportCancel,
    handleDialogPublishedReportConfirm,
    handleModalReportClose,
    handleModalReportOpen,
    hasNonPublishedReportForThePeriod,
    hasPublishedReportForThePeriod,
    isContinueDisabled,
    isPreviewDisabled,
    isReportParametersFetching,
    isSearchReportFetching,
    isDialogNonPublishedReportOpen,
    isDialogPublishedReportOpen,
    isModalReportOpen
  }
}
