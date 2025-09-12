import { UseMutateAsyncFunction } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { CreateReportRequest, CreateReportResponse200, ReportType } from 'libs/api-connectors/backend-connector-lob/api/reports/reportsApi.types.ts'
import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation'
import { useDialogAlert } from 'libs/ui-kit/components/DialogAlert/useDialogAlert.ts'
import { getSearchReportPayload } from 'modules/report-parameters/utils/payload'
import { ReportBalanceSheetFormValues, ReportIncomeStatementFormValues } from 'modules/report-type/components/ReportTypeForm/ReportTypeForm.types.ts'
import { formatToFloatReadyFormat } from 'modules/report-type/utils/format.ts'
import { PATHS } from 'routes'

interface DialogReportSaveState {
  period?: string
  report: ReportBalanceSheetFormValues | ReportIncomeStatementFormValues | null
  reportType?: ReportType
}

interface DialogReportSaveHandlers {
  onCreateReportConfirm: UseMutateAsyncFunction<CreateReportResponse200 | null, Error, CreateReportRequest, unknown>
}

const useDialogReportSave = (state: DialogReportSaveState, handlers: DialogReportSaveHandlers) => {
  const { period, report, reportType } = state
  const { onCreateReportConfirm } = handlers
  const selectedOrganisation = useSelectedOrganisation()

  const navigate = useNavigate()

  const { isOpen, handleDialogClose, handleDialogOpen } = useDialogAlert()

  const handleDialogCancel = () => {
    handleDialogClose()
  }

  const handleDialogConfirm = async () => {
    if (!period || !report || !reportType) return

    const periods = getSearchReportPayload(period)

    const details = Object.entries(report).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: formatToFloatReadyFormat(value)
      }),
      {}
    )

    const payload = { ...periods, ...details }

    await onCreateReportConfirm(
      {
        organisationId: selectedOrganisation,
        reportType,
        ...payload
      },
      {
        onSuccess: () => {
          handleDialogClose()
          navigate(PATHS.REPORTING, { replace: true, state: { hasReportCreated: true } })
        }
      }
    )
  }

  return {
    isDialogReportSaveOpen: isOpen,
    handleDialogReportSaveCancel: handleDialogCancel,
    handleDialogReportSaveConfirm: handleDialogConfirm,
    handleDialogReportSaveOpen: handleDialogOpen
  }
}

export const useDialogReportNewSave = (state: DialogReportSaveState, handlers: DialogReportSaveHandlers) => {
  const { isDialogReportSaveOpen, handleDialogReportSaveCancel, handleDialogReportSaveConfirm, handleDialogReportSaveOpen } = useDialogReportSave(state, handlers)

  return {
    isDialogReportNewSaveOpen: isDialogReportSaveOpen,
    handleDialogReportNewSaveCancel: handleDialogReportSaveCancel,
    handleDialogReportNewSaveConfirm: handleDialogReportSaveConfirm,
    handleDialogReportNewSaveOpen: handleDialogReportSaveOpen
  }
}

export const useDialogReportEditSave = (state: DialogReportSaveState, handlers: DialogReportSaveHandlers) => {
  const { isDialogReportSaveOpen, handleDialogReportSaveCancel, handleDialogReportSaveConfirm, handleDialogReportSaveOpen } = useDialogReportSave(state, handlers)

  return {
    isDialogReportEditSaveOpen: isDialogReportSaveOpen,
    handleDialogReportEditSaveCancel: handleDialogReportSaveCancel,
    handleDialogReportEditSaveConfirm: handleDialogReportSaveConfirm,
    handleDialogReportEditSaveOpen: handleDialogReportSaveOpen
  }
}

export const useDialogReportPublishedNewSave = (state: DialogReportSaveState, handlers: DialogReportSaveHandlers) => {
  const { isDialogReportSaveOpen, handleDialogReportSaveCancel, handleDialogReportSaveConfirm, handleDialogReportSaveOpen } = useDialogReportSave(state, handlers)

  return {
    isDialogReportPublishedNewSaveOpen: isDialogReportSaveOpen,
    handleDialogReportPublishedNewSaveCancel: handleDialogReportSaveCancel,
    handleDialogReportPublishedNewSaveConfirm: handleDialogReportSaveConfirm,
    handleDialogReportPublishedNewSaveOpen: handleDialogReportSaveOpen
  }
}
