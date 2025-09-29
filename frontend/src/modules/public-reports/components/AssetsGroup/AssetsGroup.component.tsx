import { useTheme } from '@mui/material'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { FormikErrors } from 'formik'

import { FieldNumeric } from 'libs/form-kit/components/FieldNumeric/FieldNumeric.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ReportBalanceSheetFormValues } from 'modules/public-reports/components/ReportTypeForm/ReportTypeForm.types.ts'
import { Total } from 'modules/public-reports/components/Total/Total.component.tsx'
import { BalanceSheetFormErrorValues } from 'modules/public-reports/hooks/useReportTypeForm.ts'
import { BalanceSheetWarnings } from 'modules/public-reports/hooks/useReportValidate.ts'
import { getTotalCurrentAssets, getTotalNonCurrentAssets } from 'modules/public-reports/utils/calculations.ts'

interface AssetsGroupProps {
  errors: FormikErrors<BalanceSheetFormErrorValues>
  warnings?: BalanceSheetWarnings
  values: ReportBalanceSheetFormValues
  isPresentationMode?: boolean
}

export const AssetsGroup = ({ errors, warnings, values, isPresentationMode = false }: AssetsGroupProps) => {
  const { t } = useTranslations()

  const theme = useTheme()

  const { balance } = errors ?? {}

  const totalCurrentAssets = getTotalCurrentAssets(values)
  const totalNonCurrentAssets = getTotalNonCurrentAssets(values)
  const totalAssets = totalCurrentAssets + totalNonCurrentAssets

  return (
    <Grid container direction="column" mb={5} spacing={2}>
      <Grid size="auto">
        <Typography color={theme.palette.text.secondary} component="h3" variant="overline">
          {t({ id: 'assets' })}
        </Typography>
      </Grid>
      <Grid size={12}>
        <FieldNumeric label={t({ id: 'cashAndCashEquivalents' })} name="cashAndCashEquivalents" isReadOnly={isPresentationMode} isValid={warnings?.cashAndCashEquivalents} />
      </Grid>
      <Grid size={12}>
        <FieldNumeric label={t({ id: 'cryptoAssets' })} name="cryptoAssets" isReadOnly={isPresentationMode} isValid={warnings?.cryptoAssets} />
      </Grid>
      <Grid size={12}>
        <FieldNumeric label={t({ id: 'otherReceivable' })} name="otherReceivables" isReadOnly={isPresentationMode} isValid={warnings?.otherReceivables} />
      </Grid>
      <Grid size={12}>
        <FieldNumeric
          label={t({ id: 'prepaymentsAndOtherShortTermAssets' })}
          name="prepaymentsAndOtherShortTermAssets"
          isReadOnly={isPresentationMode}
          isValid={warnings?.prepaymentsAndOtherShortTermAssets}
        />
      </Grid>
      <Grid size={12}>
        <Total label={t({ id: 'totalCurrentAssets' })} value={totalCurrentAssets} />
      </Grid>
      <Grid size={12}>
        <FieldNumeric label={t({ id: 'financialAssets' })} name="financialAssets" isReadOnly={isPresentationMode} isValid={warnings?.financialAssets} />
      </Grid>
      <Grid size={12}>
        <FieldNumeric label={t({ id: 'investments' })} name="investments" isReadOnly={isPresentationMode} isValid={warnings?.investments} />
      </Grid>
      <Grid size={12}>
        <FieldNumeric label={t({ id: 'tangibleAssets' })} name="tangibleAssets" isReadOnly={isPresentationMode} isValid={warnings?.tangibleAssets} />
      </Grid>
      <Grid size={12}>
        <FieldNumeric label={t({ id: 'intangibleAssets' })} name="intangibleAssets" isReadOnly={isPresentationMode} isValid={warnings?.intangibleAssets} />
      </Grid>
      <Grid size={12}>
        <Total label={t({ id: 'totalNonCurrentAssets' })} value={totalNonCurrentAssets} />
      </Grid>
      <Grid size={12}>
        <Total label={t({ id: 'totalAssets' })} value={totalAssets} hasError={Boolean(balance)} />
      </Grid>
    </Grid>
  )
}
