import { useState } from 'react'

import { useModal } from 'features/common'
import { ReportEntity } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types'
import { useDownloadPublicReportModel } from 'libs/models/reports-model/DownloadPublicReport/DownloadPublicReportModel.service.ts'
import { useSnackbar } from 'libs/ui-kit/components/Snackbar/useSnackbar.tsx'
import { saveFile } from 'libs/utils/saveFile.ts'
import { getReportPeriod } from 'modules/public-reports/utils/payload'


export const useModalReport = () => {
  const { handleModalClose, handleModalOpen, isOpen } = useModal()

  return { handleModalReportClose: handleModalClose, handleModalReportOpen: handleModalOpen, isModalReportOpen: isOpen }
}

export const useModalReportView = () => {
  const [report, setReport] = useState<ReportEntity | null>(null)

  const { handleModalReportClose, handleModalReportOpen, isModalReportOpen } = useModalReport()

  const handleReportViewOpen = (report: ReportEntity) => {
    setReport(report)
    handleModalReportOpen()
  }

  const handleReportViewClose = () => {
    setReport(null)
    handleModalReportClose()
  }

  return { report, handleReportViewClose, handleReportViewOpen, isReportViewOpen: isModalReportOpen }
}

export const useModalReportDownload = (report: ReportEntity) => {
  const { triggerDownloadReport, isDownloadPending } = useDownloadPublicReportModel()
  const { isSnackbarVisible, showSnackbar, handleClose } = useSnackbar()

  const handleDownload = async () => {
    const { organisationId, txHash, subType, intervalType, period, year } = report

    try {
      const csv = await triggerDownloadReport({ organisationId, txHash })
      if (csv === null) throw new Error('Empty CSV response')
      saveFile(csv, `report_${subType}_${getReportPeriod(intervalType, period, year).replace(' ', '_')}.csv`, 'text/csv')
    } catch {
      showSnackbar()
    }
  }

  return { isDownloadPending, handleDownload, isSnackbarVisible, handleSnackbarClose: handleClose }
}