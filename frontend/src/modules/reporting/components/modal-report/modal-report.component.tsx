import { Modal } from 'features/common'
import { Alert, Box, Typography } from 'features/mui/base'
import { PublishError } from 'libs/api-connectors/backend-connector-lob/api/reports/reportsApi.types'
import { useTranslations } from 'libs/translations/hooks/useTranslations'
import { ReportTypeForm } from 'modules/report-type/components/ReportTypeForm/ReportTypeForm.form'

import { useModalReportInternalState } from './modal-report.hooks'
import type { ModalReportProps } from './modal-report.types'

const PUBLISH_ERROR_MESSAGES: Record<PublishError, string> = {
  [PublishError.INVALID_REPORT_DATA]: 'invalidReportDataErrorMessage',
  [PublishError.PROFIT_FOR_THE_YEAR_MISMATCH]: 'profitForTheYearMismatchWarningMessage',
  [PublishError.REPORT_DATA_MISMATCH]: 'reportDataMismatchWarningMessage'
}

export const ModalReport = ({ report, onClose, hasNonPublishedReportForThePeriod, hasPublishedReportForThePeriod, isOpen, isPreviewMode }: ModalReportProps) => {
  const { t } = useTranslations()

  const { canPublishError, currency, reportPeriod, type, values, isPendingReport } = useModalReportInternalState({ report })

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <Modal.Header hasCloseButton>{t({ id: 'reportViewTitle' }, { currency, period: reportPeriod, type: t({ id: type }) })}</Modal.Header>
      <Modal.Content isPreviewMode={isPreviewMode}>
        {isPreviewMode && (hasNonPublishedReportForThePeriod || hasPublishedReportForThePeriod) && (
          <Box pb={5}>
            <Alert severity="warning">
              <Typography variant="body2">{t({ id: hasPublishedReportForThePeriod ? 'reportPublishedWarningMessage' : 'reportNonPublishedWarningMessage' })}</Typography>
            </Alert>
          </Box>
        )}
        {isPendingReport && canPublishError && (
          <Box pb={5}>
            <Alert severity={canPublishError === PublishError.INVALID_REPORT_DATA ? 'error' : 'warning'}>
              <Typography variant="body2">{t({ id: PUBLISH_ERROR_MESSAGES[canPublishError] })}</Typography>
            </Alert>
          </Box>
        )}
        <ReportTypeForm reportType={type} values={values} isPresentationMode isFetching={false} />
      </Modal.Content>
    </Modal>
  )
}
