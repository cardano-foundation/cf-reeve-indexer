import { useState } from 'react'

import { useModal } from 'features/common'
import { ReportEntity } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types'


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