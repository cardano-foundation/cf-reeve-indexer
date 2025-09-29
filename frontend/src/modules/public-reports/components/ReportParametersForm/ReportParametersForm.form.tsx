import { useTheme } from '@mui/material'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { Form, Formik, FormikProps } from 'formik'

import { GetReportParametersResponse200 } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types.ts'
import { FieldCurrency } from 'libs/form-kit/components/FieldCurrency/FieldCurrency.component.tsx'
import { FieldPeriod } from 'libs/form-kit/components/FieldPeriod/FieldPeriod.component.tsx'
import { FieldReport } from 'libs/form-kit/components/FieldReport/FieldReport.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonPrimary } from 'libs/ui-kit/components/ButtonPrimary/ButtonPrimary.component.tsx'
import { EmptyStatePage } from 'libs/ui-kit/components/EmptyStatePage/EmptyStatePage.component.tsx'
import { LoaderCentered } from 'libs/ui-kit/components/LoaderCentered/LoaderCentered.component.tsx'
import { ReportParametersFormValues } from 'modules/public-reports/components/ReportParametersForm/ReportParametersForm.types.ts'
import { getReportCurrencyOptions, getReportPeriodOptions, getReportTypeOptions } from 'modules/public-reports/components/ReportParametersForm/ReportParametersForm.utils.ts'

interface ExtractionFormLayoutProps extends FormikProps<ReportParametersFormValues> {
  reportParameters: GetReportParametersResponse200 | null
}

const ReportParametersFormLayout = ({ reportParameters, values }: ExtractionFormLayoutProps) => {
  const { t } = useTranslations()

  const theme = useTheme()

  const { currencyType, periodFrom, reportType } = reportParameters ?? {}

  const reportTypeOptions = getReportTypeOptions(reportType)
  const reportPeriodOptions = getReportPeriodOptions(periodFrom)
  const reportCurrencyOptions = getReportCurrencyOptions(currencyType)

  const isContinueDisabled = !values.report || !values.period || !values.currency

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
      </Grid>
      <Divider />
      <Grid container mt={4} size={12} spacing={4}>
        <Grid alignItems="center" display="flex" size={{ xs: 12, md: 8 }}>
          <Typography color={theme.palette.text.secondary} variant="body2">
            {t({ id: 'mandatoryFields' })}
          </Typography>
        </Grid>
        <Grid display="flex" justifyContent="flex-end" size={{ xs: 12, md: 4 }}>
          <ButtonPrimary type="submit" disabled={isContinueDisabled}>
            {t({ id: 'continue' })}
          </ButtonPrimary>
        </Grid>
      </Grid>
    </Form>
  )
}

interface ReportParametersFormProps {
  initialValues: ReportParametersFormValues
  reportParameters: GetReportParametersResponse200 | null
  onSubmit: (values: ReportParametersFormValues) => void
  isFetching: boolean
}

export const ReportParametersForm = ({ initialValues, reportParameters, onSubmit, isFetching }: ReportParametersFormProps) => {
  const { t } = useTranslations()

  if (isFetching) {
    return <EmptyStatePage asset={<LoaderCentered size={56} />} message={t({ id: 'loadingMessage' })} />
  }

  return (
    <Formik<ReportParametersFormValues>
      component={(props) => <ReportParametersFormLayout {...props} reportParameters={reportParameters} />}
      initialValues={initialValues}
      onSubmit={onSubmit}
      enableReinitialize
    />
  )
}
