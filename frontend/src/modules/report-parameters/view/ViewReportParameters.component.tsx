import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { FormikProvider } from 'formik'

import { LayoutAuth } from 'libs/layout-kit/layout-auth/LayoutAuth.component.tsx'
import { hasPermission } from 'libs/permissions/has-permission'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { DialogAlertNonPublishedReport } from 'modules/report-parameters/components/DialogAlertNonPublishedReport/DialogAlertNonPublishedReport.component.tsx'
import { DialogAlertPublishedReport } from 'modules/report-parameters/components/DialogAlertPublishedReport/DialogAlertPublishedReport.component.tsx'
import { ReportParametersForm } from 'modules/report-parameters/components/ReportParametersForm/ReportParametersForm.form.tsx'
import { useReportParameters } from 'modules/report-parameters/hooks/useReportParameters.ts'
import { ModalReport } from 'modules/reporting/components'

export const ViewReportParameters = () => {
  const { t } = useTranslations()

  const {
    formik,
    previewReport,
    reportParameters,
    handleContinue,
    handleDialogNonPublishedReportCancel,
    handleDialogNonPublishedReportConfirm,
    handleDialogPublishedReportCancel,
    handleDialogPublishedReportConfirm,
    handleModalReportClose,
    handleModalReportOpen,
    hasNonPublishedReportForThePeriod,
    hasPublishedReportForThePeriod,
    isContinueDisabled,
    isPreviewDisabled,
    isReportParametersFetching,
    isDialogNonPublishedReportOpen,
    isDialogPublishedReportOpen,
    isModalReportOpen
  } = useReportParameters()

  return (
    <>
      <LayoutAuth.Header>
        <LayoutAuth.Header.Details description={t({ id: 'reportParametersDescription' })} title={t({ id: 'reportParametersViewTitle' })} />
      </LayoutAuth.Header>
      <LayoutAuth.Main flexDirection="column" mx="auto" maxWidth="30.3125rem" pt={1}>
        <Box mb={3}>
          <Typography variant="body2">{t({ id: 'reportParametersFormTitle' })}</Typography>
        </Box>
        <FormikProvider value={formik}>
          <ReportParametersForm
            reportParameters={reportParameters}
            onContinue={handleContinue}
            onModalReportOpen={handleModalReportOpen}
            isContinueDisabled={isContinueDisabled}
            isPreviewDisabled={isPreviewDisabled}
            isFetching={isReportParametersFetching}
          />
        </FormikProvider>
      </LayoutAuth.Main>
      <DialogAlertNonPublishedReport isOpen={isDialogNonPublishedReportOpen} onCancel={handleDialogNonPublishedReportCancel} onConfirm={handleDialogNonPublishedReportConfirm} />
      <DialogAlertPublishedReport isOpen={isDialogPublishedReportOpen} onCancel={handleDialogPublishedReportCancel} onConfirm={handleDialogPublishedReportConfirm} />
      {hasPermission('reports', 'preview') && previewReport && (
        <ModalReport
          report={previewReport}
          onClose={handleModalReportClose}
          hasNonPublishedReportForThePeriod={hasNonPublishedReportForThePeriod}
          hasPublishedReportForThePeriod={hasPublishedReportForThePeriod}
          isOpen={isModalReportOpen}
          isPreviewMode
        />
      )}
    </>
  )
}
