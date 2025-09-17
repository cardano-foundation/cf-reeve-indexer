import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { ReportBalanceSheetApiResponse, ReportIncomeStatementApiResponse, ReportType } from 'libs/api-connectors/backend-connector-lob/api/reports/publicReports.types'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonSecondary } from 'libs/ui-kit/components/ButtonSecondary/ButtonSecondary.component.tsx'
import { ButtonText } from 'libs/ui-kit/components/ButtonText/ButtonText.component.tsx'
import { ModalAction } from 'libs/ui-kit/components/ModalAction/ModalAction.component.tsx'
import { formatCurrency } from 'modules/organizationDetails/components/organization-form/Organization.utils.ts'
import { getReportPeriod } from 'modules/report-parameters/utils/payload.ts'
import { AlertView } from 'modules/report-type/components/AlertView/AlertView.component.tsx'
import { ReportTypeForm } from 'modules/report-type/components/ReportTypeForm/ReportTypeForm.form.tsx'
import { ReportBalanceSheetFormValues, ReportIncomeStatementFormValues } from 'modules/report-type/components/ReportTypeForm/ReportTypeForm.types.ts'
import { getBalanceSheetInitialValues, getIncomeStatementInitialValues } from 'modules/report-type/utils/form.ts'

interface ModalReportViewProps {
  report: ReportBalanceSheetApiResponse | ReportIncomeStatementApiResponse
  hasGhostButton?: boolean
}

export const ModalReportView = ({ report, hasGhostButton = false }: ModalReportViewProps) => {
  const { t } = useTranslations()

  const { documentCurrencyCustomerCode, intervalType, period, type, year } = report

  // TODO: BE should return it every time
  const currency = formatCurrency(documentCurrencyCustomerCode ?? 'ISO-4217:CHF')

  const reportPeriod = getReportPeriod(intervalType, period, year)

  const isPendingReport = !report.publish && !report.canBePublish

  const values: ReportBalanceSheetFormValues | ReportIncomeStatementFormValues =
    report.type === ReportType.BALANCE_SHEET ? getBalanceSheetInitialValues(report) : getIncomeStatementInitialValues(report)

  return (
    <ModalAction
      aria-label={t({ id: 'reportDetailsModalTitle' })}
      hasButtonClose
      maxWidth={false}
      fullWidth
      sx={{ maxHeight: '80vh', mt: '10vh', '&& .MuiPaper-root': { maxWidth: '41.125rem' } }}
      renderButton={({ handleClickOpen, isModalDisabled }) =>
        hasGhostButton ? (
          <ButtonText size="small" onClick={handleClickOpen} disabled={isModalDisabled}>
            {t({ id: 'view' })}
          </ButtonText>
        ) : (
          <ButtonSecondary size="small" onClick={handleClickOpen} disabled={isModalDisabled}>
            {t({ id: 'view' })}
          </ButtonSecondary>
        )
      }
    >
      <Typography variant="h6" fontWeight="bold" pb={5}>
        {t({ id: 'reportViewTitle' }, { currency, period: reportPeriod, type: t({ id: type }) })}
      </Typography>
      {isPendingReport && (
        <Box pb={5}>
          <AlertView message={t({ id: 'crossReportProfiValidationMessage' })} severity="warning" />
        </Box>
      )}
      <ReportTypeForm reportType={type} values={values} isPresentationMode isFetching={false} />
    </ModalAction>
  )
}
