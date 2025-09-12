import { useState } from 'react'

import { useCreateReportModel } from 'libs/models/reports-model/CreateReportModel/CreateReport.service.ts'
import { ReportBalanceSheetFormValues, ReportIncomeStatementFormValues } from 'modules/report-type/components/ReportTypeForm/ReportTypeForm.types.ts'
import { useDialogReportEditSave, useDialogReportNewSave, useDialogReportPublishedNewSave } from 'modules/report-type/hooks/useDialogReportSave.ts'
import { useReportTypeForm } from 'modules/report-type/hooks/useReportTypeForm.ts'
import { useReportTypeLocationState } from 'modules/report-type/hooks/useReportTypeLocationState.ts'
import { useReportTypeQueries } from 'modules/report-type/hooks/useReportTypeQueries.ts'
import { useModalReportView } from 'modules/reporting/components'

export const useReportType = () => {
  const [report, setReport] = useState<ReportBalanceSheetFormValues | ReportIncomeStatementFormValues | null>(null)

  const { currency, period, reportType, redirect, isAutomaticGeneration } = useReportTypeLocationState()

  const { generatedReportOfCurrentType, reportOfCurrentType, reportOfOppositeType, isFetching } = useReportTypeQueries({ period, reportType, isAutomaticGeneration })

  const { triggerCreateReport } = useCreateReportModel()

  const { isDialogReportNewSaveOpen, handleDialogReportNewSaveCancel, handleDialogReportNewSaveConfirm, handleDialogReportNewSaveOpen } = useDialogReportNewSave(
    { period, report, reportType },
    {
      onCreateReportConfirm: triggerCreateReport
    }
  )

  const { isDialogReportEditSaveOpen, handleDialogReportEditSaveCancel, handleDialogReportEditSaveConfirm, handleDialogReportEditSaveOpen } = useDialogReportEditSave(
    { period, report, reportType },
    {
      onCreateReportConfirm: triggerCreateReport
    }
  )

  const { isDialogReportPublishedNewSaveOpen, handleDialogReportPublishedNewSaveCancel, handleDialogReportPublishedNewSaveConfirm, handleDialogReportPublishedNewSaveOpen } =
    useDialogReportPublishedNewSave({ period, report, reportType }, { onCreateReportConfirm: triggerCreateReport })

  const { report: r, handleReportViewClose, handleReportViewOpen, isReportViewOpen } = useModalReportView()

  const { warnings, values, handleFormSubmit, handleFormValidate, handleResetWarnings, hasAnyWarnings } = useReportTypeForm(
    { generatedReportOfCurrentType, reportOfCurrentType, reportType, isAutomaticGeneration },
    {
      onDialogReportEditSaveOpen: handleDialogReportEditSaveOpen,
      onDialogReportNewSaveOpen: handleDialogReportNewSaveOpen,
      onDialogReportPublishedNewSaveOpen: handleDialogReportPublishedNewSaveOpen,
      onSaveReport: setReport
    }
  )

  return {
    currency,
    period,
    report: r,
    reportOfCurrentType,
    reportOfOppositeType,
    reportType,
    redirect,
    warnings,
    values,
    hasAnyWarnings,
    isAutomaticGeneration,
    isDialogReportEditSaveOpen,
    isDialogReportNewSaveOpen,
    isDialogReportPublishedNewSaveOpen,
    isFetching,
    isReportViewOpen,
    handleDialogReportEditSaveCancel,
    handleDialogReportEditSaveConfirm,
    handleDialogReportNewSaveCancel,
    handleDialogReportNewSaveConfirm,
    handleDialogReportPublishedNewSaveCancel,
    handleDialogReportPublishedNewSaveConfirm,
    handleFormSubmit,
    handleFormValidate,
    handleResetWarnings,
    handleReportViewClose,
    handleReportViewOpen
  }
}
