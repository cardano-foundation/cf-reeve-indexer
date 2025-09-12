import { useQueryClient } from '@tanstack/react-query'

import { PublishReportRequest } from 'libs/api-connectors/backend-connector-lob/api/reports/reportsApi.types.ts'
import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation'
import { useGetReportsModel } from 'libs/models/reports-model/GetReportsModel/GetReports.service.ts'
import { usePublishReportModel } from 'libs/models/reports-model/PublishReportModel/PublishReport.service.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { Snackbar } from 'libs/ui-kit/components/Snackbar/Snackbar.component.tsx'
import { useSnackbar } from 'libs/ui-kit/components/Snackbar/useSnackbar.tsx'
import { ModalReport, useModalReportView } from 'modules/reporting/components'
import { TableReportsPublish } from 'modules/reports-publish/components/TableReportsPublish/TableReportsPublish.component.tsx'

export const TabPanelReportsPublish = () => {
  const queryClient = useQueryClient()
  const selectedOrganisation = useSelectedOrganisation()

  const { t } = useTranslations()

  const { reports, isFetching } = useGetReportsModel({ organisationId: selectedOrganisation })

  const { triggerPublishReport } = usePublishReportModel()

  const { report, handleReportViewClose, handleReportViewOpen, isReportViewOpen } = useModalReportView()

  const { isSnackbarVisible, showSnackbar, handleClose } = useSnackbar()

  const reportsPublish = [...(reports?.report ?? [])].filter((report) => !report.publish && report.canBePublish)

  const handlePublishReport = async ({ reportId }: Pick<PublishReportRequest, 'reportId'>) => {
    await triggerPublishReport(
      {
        organisationId: selectedOrganisation,
        reportId
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['REPORTS'] })
          showSnackbar()
        }
      }
    )
  }

  return (
    <>
      <TableReportsPublish data={reportsPublish} onPublishReport={handlePublishReport} onViewOpen={handleReportViewOpen} isFetching={isFetching} />
      {report && <ModalReport report={report} onClose={handleReportViewClose} isOpen={isReportViewOpen} />}
      {/* TODO: Snackbar should be a part of root layout and modified with context methods */}
      <Snackbar open={isSnackbarVisible} onClose={handleClose} message={t({ id: 'reportPublished' })} />
    </>
  )
}
