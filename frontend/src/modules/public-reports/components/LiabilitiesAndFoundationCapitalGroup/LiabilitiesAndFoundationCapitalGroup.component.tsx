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
import { getTotalFoundationCapital, getTotalLongTermLiabilities, getTotalShortTermLiabilities } from 'modules/public-reports/utils/calculations.ts'

interface LiabilitiesAndFoundationCapitalGroupProps {
  errors: FormikErrors<BalanceSheetFormErrorValues>
  warnings?: BalanceSheetWarnings
  values: ReportBalanceSheetFormValues
  isCrossReportProfitEqual?: boolean
  isPresentationMode?: boolean
}

export const LiabilitiesAndFoundationCapitalGroup = ({
  errors,
  warnings,
  values,
  isCrossReportProfitEqual,
  isPresentationMode = false
}: LiabilitiesAndFoundationCapitalGroupProps) => {
  const { t } = useTranslations()

  const theme = useTheme()

  const { balance } = errors ?? {}

  const totalShortTermLiabilities = getTotalShortTermLiabilities(values)
  const totalLongTermLiabilities = getTotalLongTermLiabilities(values)
  const totalFoundationCapital = getTotalFoundationCapital(values)
  const totalLiabilities = totalShortTermLiabilities + totalLongTermLiabilities
  const totalLiabilitiesAndFoundationCapital = totalLiabilities + totalFoundationCapital

  return (
    <Grid container direction="column" mb={5} spacing={2}>
      <Grid size="auto">
        <Typography color={theme.palette.text.secondary} component="h3" variant="overline">
          {t({ id: 'liabilitiesAndFoundationCapital' })}
        </Typography>
      </Grid>
      <Grid size={12}>
        <FieldNumeric label={t({ id: 'tradeAccountPayable' })} name="tradeAccountsPayables" isReadOnly={isPresentationMode} isValid={warnings?.tradeAccountsPayables} />
      </Grid>
      <Grid size={12}>
        <FieldNumeric
          label={t({ id: 'otherShortTermLiabilities' })}
          name="otherShortTermLiabilities"
          isReadOnly={isPresentationMode}
          isValid={warnings?.otherShortTermLiabilities}
        />
      </Grid>
      <Grid size={12}>
        <FieldNumeric
          label={t({ id: 'accrualsAndShortTermProvisions' })}
          name="accrualsAndShortTermProvisions"
          isReadOnly={isPresentationMode}
          isValid={warnings?.accrualsAndShortTermProvisions}
        />
      </Grid>
      <Grid size={12}>
        <Total label={t({ id: 'totalShortTermLiabilities' })} value={totalShortTermLiabilities} />
      </Grid>
      <Grid size={12}>
        <FieldNumeric label={t({ id: 'provisions' })} name="provisions" isReadOnly={isPresentationMode} isValid={warnings?.provisions} />
      </Grid>
      <Grid size={12}>
        <Total label={t({ id: 'totalLongTermLiabilities' })} value={totalLongTermLiabilities} />
      </Grid>
      <Grid size={12}>
        <Total label={t({ id: 'totalLiabilities' })} value={totalLiabilities} />
      </Grid>
      <Grid size={12}>
        <FieldNumeric label={t({ id: 'foundationCapital' })} name="capital" isReadOnly={isPresentationMode} isValid={warnings?.capital} />
      </Grid>
      <Grid size={12}>
        <FieldNumeric label={t({ id: 'resultsCarriedForwards' })} name="resultsCarriedForward" isReadOnly={isPresentationMode} isValid={warnings?.resultsCarriedForward} />
      </Grid>
      <Grid size={12}>
        <FieldNumeric
          label={t({ id: 'profitForTheYear' })}
          name="profitForTheYear"
          isReadOnly={isPresentationMode}
          isValid={(isCrossReportProfitEqual !== undefined ? !isCrossReportProfitEqual : isCrossReportProfitEqual) || warnings?.profitForTheYear}
        />
      </Grid>
      <Grid size={12}>
        <Total label={t({ id: 'totalFoundationCapital' })} value={totalFoundationCapital} />
      </Grid>
      <Grid size={12}>
        <Total label={t({ id: 'totalLiabilitiesAndFoundationCapital' })} value={totalLiabilitiesAndFoundationCapital} hasError={Boolean(balance)} />
      </Grid>
    </Grid>
  )
}
