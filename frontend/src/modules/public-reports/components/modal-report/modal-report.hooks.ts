import { useState } from 'react'

import { useModal } from 'features/common'
import { ReportApiResponse, ReportType } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types'
import { formatCurrency } from 'modules/public-reports/utils/format.ts'
import { getReportPeriod } from 'modules/public-reports/utils/payload.ts'
import type { ReportBalanceSheetFormValues, ReportIncomeStatementFormValues } from 'modules/public-reports/components/ReportTypeForm/ReportTypeForm.types'
import { getBalanceSheetInitialValues, getIncomeStatementInitialValues } from 'modules/public-reports/utils/form'

import type { ModalReportState } from './modal-report.types'

export const useModalReport = () => {
  const { handleModalClose, handleModalOpen, isOpen } = useModal()

  return { handleModalReportClose: handleModalClose, handleModalReportOpen: handleModalOpen, isModalReportOpen: isOpen }
}

export const useModalReportView = () => {
  const [report, setReport] = useState<ReportApiResponse | null>(null)

  const { handleModalReportClose, handleModalReportOpen, isModalReportOpen } = useModalReport()

  const handleReportViewOpen = (report: ReportApiResponse) => {
    setReport(report)
    handleModalReportOpen()
  }

  const handleReportViewClose = () => {
    setReport(null)
    handleModalReportClose()
  }

  return { report, handleReportViewClose, handleReportViewOpen, isReportViewOpen: isModalReportOpen }
}

export const useModalReportInternalState = (state: ModalReportState) => {
  const { report } = state

  const { canPublishError, documentCurrencyCustomerCode, intervalType, period, type, year, publish, canBePublish } = report

  const currency = formatCurrency(documentCurrencyCustomerCode ?? 'ISO-4217:CHF')

  const reportPeriod = getReportPeriod(intervalType, period, year)

  const isPendingReport = !publish && !canBePublish

  const values: ReportBalanceSheetFormValues | ReportIncomeStatementFormValues =
    type === ReportType.BALANCE_SHEET ? getBalanceSheetInitialValues(report) : getIncomeStatementInitialValues(report)

  return { canPublishError, currency, reportPeriod, type, values, isPendingReport }
}
