import { useTheme } from '@mui/material'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { Form } from 'formik'

import { GetReportParametersResponse200 } from 'libs/api-connectors/backend-connector-lob/api/reports/publicReports.types.ts'
import { FieldAutomaticGeneration } from 'libs/form-kit/components/FieldAutomaticGeneration/FieldAutomaticGeneration.component.tsx'
import { FieldCurrency } from 'libs/form-kit/components/FieldCurrency/FieldCurrency.component.tsx'
import { FieldPeriod } from 'libs/form-kit/components/FieldPeriod/FieldPeriod.component.tsx'
import { FieldReport } from 'libs/form-kit/components/FieldReport/FieldReport.component.tsx'
import { hasPermission } from 'libs/permissions/has-permission.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonPrimary } from 'libs/ui-kit/components/ButtonPrimary/ButtonPrimary.component.tsx'
import { ButtonSecondary } from 'libs/ui-kit/components/ButtonSecondary/ButtonSecondary.component.tsx'
import { EmptyStatePage } from 'libs/ui-kit/components/EmptyStatePage/EmptyStatePage.component.tsx'
import { LoaderCentered } from 'libs/ui-kit/components/LoaderCentered/LoaderCentered.component.tsx'
import { getReportCurrencyOptions, getReportPeriodOptions, getReportTypeOptions } from 'modules/report-parameters/components/ReportParametersForm/ReportParametersForm.utils.ts'

interface ExtractionFormLayoutProps {
  reportParameters: GetReportParametersResponse200 | null
  onContinue: () => void
  onModalReportOpen: () => void
  isContinueDisabled: boolean
  isPreviewDisabled: boolean
}

const ReportParametersFormLayout = ({ reportParameters, onContinue, onModalReportOpen, isContinueDisabled, isPreviewDisabled }: ExtractionFormLayoutProps) => {
  const { t } = useTranslations()

  const theme = useTheme()

  const { currencyType, periodFrom, reportType } = reportParameters ?? {}

  const reportTypeOptions = getReportTypeOptions(reportType)
  const reportPeriodOptions = getReportPeriodOptions(periodFrom)
  const reportCurrencyOptions = getReportCurrencyOptions(currencyType)

  return (
    <Form>
      <Grid container mb={4} spacing={3}>
        <Grid size={12}>
          <FieldReport items={reportTypeOptions} isRequired />
        </Grid>
        <Grid container size={12}>
          <Grid size={{ xs: 12, md: 'grow' }}>
            <FieldPeriod items={reportPeriodOptions} isRequired />
          </Grid>
          <Grid size={{ xs: 12, md: 'grow' }}>
            <FieldCurrency items={reportCurrencyOptions} isRequired />
          </Grid>
        </Grid>
        <Grid px={1} size={12}>
          <FieldAutomaticGeneration />
        </Grid>
      </Grid>
      <Divider />
      <Grid container mt={4} size={12} spacing={4}>
        <Grid alignItems="center" display="flex" size={{ xs: 12, md: 'grow' }}>
          <Typography color={theme.palette.text.secondary} variant="body2">
            {t({ id: 'mandatoryFields' })}
          </Typography>
        </Grid>
        <Grid container display="flex" justifyContent="flex-end" size={{ xs: 12, md: 'auto' }} spacing={1}>
          {hasPermission('reports', 'preview') && (
            <Grid size="auto">
              <ButtonSecondary type="button" onClick={onModalReportOpen} disabled={isPreviewDisabled}>
                {t({ id: 'preview' })}
              </ButtonSecondary>
            </Grid>
          )}
          <Grid size="auto">
            <ButtonPrimary type="submit" onClick={onContinue} disabled={isContinueDisabled}>
              {t({ id: 'continue' })}
            </ButtonPrimary>
          </Grid>
        </Grid>
      </Grid>
    </Form>
  )
}

interface ReportParametersFormProps {
  reportParameters: GetReportParametersResponse200 | null
  onContinue: () => void
  onModalReportOpen: () => void
  isContinueDisabled: boolean
  isPreviewDisabled: boolean
  isFetching: boolean
}

export const ReportParametersForm = ({ reportParameters, onContinue, onModalReportOpen, isContinueDisabled, isPreviewDisabled, isFetching }: ReportParametersFormProps) => {
  const { t } = useTranslations()

  if (isFetching) {
    return <EmptyStatePage asset={<LoaderCentered size={56} />} message={t({ id: 'loadingMessage' })} />
  }

  return (
    <ReportParametersFormLayout
      reportParameters={reportParameters}
      onContinue={onContinue}
      onModalReportOpen={onModalReportOpen}
      isContinueDisabled={isContinueDisabled}
      isPreviewDisabled={isPreviewDisabled}
    />
  )
}
