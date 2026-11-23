import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { ReportEntity } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types'
import { useGetPublicReportByTxHashModel } from 'libs/models/reports-model/GetPublicReportByTxHash/GetPublicReportByTxHash.service.ts'
import { useSnackbar } from 'libs/ui-kit/components/Snackbar/useSnackbar.tsx'
import { getOrgPath } from 'routes'

interface SharedReportModal {
  handleReportViewOpen: (report: ReportEntity) => void
  handleReportViewClose: () => void
}

export const useSharedReport = ({ handleReportViewOpen, handleReportViewClose }: SharedReportModal) => {
  const { organisationId = '', txHash = '' } = useParams<{ organisationId: string; txHash: string }>()
  const navigate = useNavigate()
  const { isSnackbarVisible, showSnackbar, handleClose } = useSnackbar()
  const [isSharedReportError, setIsSharedReportError] = useState(false)

  const { report, isFetched, isError } = useGetPublicReportByTxHashModel({ organisationId, txHash }, Boolean(organisationId && txHash))

  useEffect(() => {
    if (!txHash || !isFetched) return

    if (report) {
      handleReportViewOpen(report)
    } else {
      setIsSharedReportError(isError)
      showSnackbar()
      navigate(getOrgPath('reports', organisationId), { replace: true })
    }
  }, [txHash, isFetched, report])

  const handleSharedReportClose = () => {
    handleReportViewClose()

    if (txHash) navigate(getOrgPath('reports', organisationId), { replace: true })
  }

  return { handleSharedReportClose, isSharedReportError, isSnackbarVisible, handleSnackbarClose: handleClose }
}
