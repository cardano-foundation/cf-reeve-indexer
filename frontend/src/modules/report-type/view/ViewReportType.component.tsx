import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'

import { ChipGroup } from 'libs/layout-kit/components/ChipGroup/ChipGroup.component.tsx'
import { LayoutAuth } from 'libs/layout-kit/layout-auth/LayoutAuth.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { Chip } from 'libs/ui-kit/components/Chip/Chip.component.tsx'
import { DialogAlertReportEdit } from 'modules/report-type/components/DialogAlertReportEdit/DialogAlertReportEdit.component.tsx'
import { DialogAlertReportNewSave } from 'modules/report-type/components/DialogAlertReportNewSave/DialogAlertReportNewSave.component.tsx'
import { DialogAlertReportPublishedNewSave } from 'modules/report-type/components/DialogAlertReportPublishedNewSave/DialogAlertReportPublishedNewSave.component.tsx'
import { ReportTypeForm } from 'modules/report-type/components/ReportTypeForm/ReportTypeForm.form.tsx'
import { useReportType } from 'modules/report-type/hooks/useReportType.ts'
import { ModalReport } from 'modules/reporting/components'
import { PATHS } from 'routes'

export const ViewReportType = () => {
  const { t } = useTranslations()

  const {
    currency,
    period,
    report,
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
  } = useReportType()

  return (
    <>
      <LayoutAuth.Header>
        <LayoutAuth.Header.ButtonBack
          component={RouterLink}
          state={!redirect ? { currency: currency?.value, period, reportType, isAutomaticGeneration } : { tab: 1 }}
          to={!redirect ? PATHS.REPORTING_REPORT_PARAMETERS : redirect}
          replace
        />
        <LayoutAuth.Header.Details title={t({ id: 'reportTypeViewTitle' })}>
          <ChipGroup>
            {reportType && <Chip label={t({ id: reportType })} />}
            {period && <Chip label={period} />}
            {currency && <Chip label={currency.name} />}
          </ChipGroup>
        </LayoutAuth.Header.Details>
      </LayoutAuth.Header>
      <LayoutAuth.Main flexDirection="column" mx="auto" maxWidth="46.25rem" pt={2}>
        <Box mb={6}>
          <Typography variant="body2">{t({ id: 'reportTypeDescription' })}</Typography>
        </Box>
        <ReportTypeForm
          reportOfCurrentType={reportOfCurrentType}
          reportOfOppositeType={reportOfOppositeType}
          reportType={reportType}
          warnings={warnings}
          values={values}
          onSubmit={handleFormSubmit}
          onValidate={handleFormValidate}
          onResetWarnings={handleResetWarnings}
          onViewOpen={handleReportViewOpen}
          isAutomaticGeneration={isAutomaticGeneration}
          isFetching={isFetching}
        />
      </LayoutAuth.Main>
      <DialogAlertReportNewSave
        onCancel={handleDialogReportNewSaveCancel}
        onConfirm={handleDialogReportNewSaveConfirm}
        isOpen={isDialogReportNewSaveOpen}
        isValid={!hasAnyWarnings}
      />
      <DialogAlertReportEdit
        onCancel={handleDialogReportEditSaveCancel}
        onConfirm={handleDialogReportEditSaveConfirm}
        isOpen={isDialogReportEditSaveOpen}
        isValid={!hasAnyWarnings}
      />
      <DialogAlertReportPublishedNewSave
        onCancel={handleDialogReportPublishedNewSaveCancel}
        onConfirm={handleDialogReportPublishedNewSaveConfirm}
        isOpen={isDialogReportPublishedNewSaveOpen}
        isValid={!hasAnyWarnings}
      />
      {report && <ModalReport report={report} onClose={handleReportViewClose} isOpen={isReportViewOpen} />}
    </>
  )
}
