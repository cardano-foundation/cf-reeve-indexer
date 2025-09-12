import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation'
import { useGetReportParametersModel } from 'libs/models/reports-model/GetReportParametersModel/GetReportParameters.service.ts'
import { useGetReportsModel } from 'libs/models/reports-model/GetReportsModel/GetReports.service.ts'
import { getReportCurrencyOptions } from 'modules/report-parameters/components/ReportParametersForm/ReportParametersForm.utils.ts'
import { ModalReport, useModalReportView } from 'modules/reporting/components'
import { TableReportsPending } from 'modules/reports-publish/components/TableReportsPending/TableReportsPending.component.tsx'

export const TabPanelReportsPending = () => {
  const selectedOrganisation = useSelectedOrganisation()

  const { reports, isFetching } = useGetReportsModel({ organisationId: selectedOrganisation })

  const { reportParameters } = useGetReportParametersModel({ organisationId: selectedOrganisation })

  const { report, handleReportViewClose, handleReportViewOpen, isReportViewOpen } = useModalReportView()

  const currencies = getReportCurrencyOptions(reportParameters?.currencyType)

  const reportsPending = [...(reports?.report ?? [])].filter((report) => !report.publish && !report.canBePublish)

  return (
    <>
      <TableReportsPending currencies={currencies} data={reportsPending} onViewOpen={handleReportViewOpen} isFetching={isFetching} />
      {report && <ModalReport report={report} onClose={handleReportViewClose} isOpen={isReportViewOpen} />}
    </>
  )
}
