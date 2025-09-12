import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation'
import { useGetReportsModel } from 'libs/models/reports-model/GetReportsModel/GetReports.service.ts'
import { ModalReport, useModalReportView } from 'modules/reporting/components'
import { TableReportsPublished } from 'modules/reports-publish/components/TableReportsPublished/TableReportsPublished.component.tsx'

export const TabPanelReportsPublished = () => {
  const selectedOrganisation = useSelectedOrganisation()

  const { reports, isFetching } = useGetReportsModel({ organisationId: selectedOrganisation })

  const { report, handleReportViewClose, handleReportViewOpen, isReportViewOpen } = useModalReportView()

  const reportsPublished = [...(reports?.report ?? [])].filter((report) => report.publish)

  return (
    <>
      <TableReportsPublished data={reportsPublished} onViewOpen={handleReportViewOpen} isFetching={isFetching} />
      {report && <ModalReport report={report} onClose={handleReportViewClose} isOpen={isReportViewOpen} />}
    </>
  )
}
