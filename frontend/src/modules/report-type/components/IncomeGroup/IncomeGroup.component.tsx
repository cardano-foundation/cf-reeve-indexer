import Grid from '@mui/material/Grid'
import { FormikErrors } from 'formik'

import { FieldNumeric } from 'libs/form-kit/components/FieldNumeric/FieldNumeric.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ReportIncomeStatementFormValues } from 'modules/report-type/components/ReportTypeForm/ReportTypeForm.types.ts'
import { Total } from 'modules/report-type/components/Total/Total.component.tsx'
import { IncomeStatementFormErrorValues } from 'modules/report-type/hooks/useReportTypeForm.ts'
import { IncomeStatementWarnings } from 'modules/report-type/hooks/useReportValidate.ts'
import { getGrossProfit, getOperatingProfit, getProfitBeforeTax, getProfitForTheYear } from 'modules/report-type/utils/calculations.ts'

interface IncomeGroupProps {
  errors: FormikErrors<IncomeStatementFormErrorValues>
  warnings?: IncomeStatementWarnings
  values: ReportIncomeStatementFormValues
  isCrossReportProfitEqual?: boolean
  isPresentationMode?: boolean
}

export const IncomeGroup = ({ warnings, values, isCrossReportProfitEqual, isPresentationMode = false }: IncomeGroupProps) => {
  const { t } = useTranslations()

  const grossProfit = getGrossProfit(values)
  const operatingProfit = getOperatingProfit(values)
  const profitBeforeTax = getProfitBeforeTax(values)
  const profitForTheYear = getProfitForTheYear(values)

  return (
    <Grid container direction="column" mb={5} spacing={2}>
      <Grid size={12}>
        <FieldNumeric label={t({ id: 'otherIncome' })} name="otherIncome" isReadOnly={isPresentationMode} isValid={warnings?.otherIncome} />
      </Grid>
      <Grid size={12}>
        <FieldNumeric label={t({ id: 'buildOfLongTermProvision' })} name="buildOfLongTermProvision" isReadOnly={isPresentationMode} isValid={warnings?.buildOfLongTermProvision} />
      </Grid>
      <Grid size={12}>
        <FieldNumeric label={t({ id: 'externalServices' })} name="externalServices" isReadOnly={isPresentationMode} isValid={warnings?.externalServices} />
      </Grid>
      <Grid size={12}>
        <Total label={t({ id: 'grossProfit' })} value={grossProfit} />
      </Grid>
      <Grid size={12}>
        <FieldNumeric label={t({ id: 'personnelExpenses' })} name="personnelExpenses" isReadOnly={isPresentationMode} isValid={warnings?.personnelExpenses} />
      </Grid>
      <Grid size={12}>
        <FieldNumeric label={t({ id: 'rentExpenses' })} name="rentExpenses" isReadOnly={isPresentationMode} isValid={warnings?.rentExpenses} />
      </Grid>
      <Grid size={12}>
        <FieldNumeric
          label={t({ id: 'generalAndAdministrativeExpenses' })}
          name="generalAndAdministrativeExpenses"
          isReadOnly={isPresentationMode}
          isValid={warnings?.generalAndAdministrativeExpenses}
        />
      </Grid>
      <Grid size={12}>
        <FieldNumeric
          label={t({ id: 'depreciationAndImpairmentLossesOnMovableTangibleAssets' })}
          name="depreciationAndImpairmentLossesOnTangibleAssets"
          isReadOnly={isPresentationMode}
          isValid={warnings?.depreciationAndImpairmentLossesOnTangibleAssets}
        />
      </Grid>
      <Grid size={12}>
        <FieldNumeric
          label={t({ id: 'amortizationOnIntangibleAssets' })}
          name="amortizationOnIntangibleAssets"
          isReadOnly={isPresentationMode}
          isValid={warnings?.amortizationOnIntangibleAssets}
        />
      </Grid>
      <Grid size={12}>
        <Total label={t({ id: 'operatingProfit' })} value={operatingProfit} />
      </Grid>
      <Grid size={12}>
        <FieldNumeric label={t({ id: 'financialIncome' })} name="financialRevenues" isReadOnly={isPresentationMode} isValid={warnings?.financialRevenues} />
      </Grid>
      <Grid size={12}>
        <FieldNumeric
          label={t({ id: 'realizedGainsOnSaleOfCryptoCurrencies' })}
          name="realisedGainsOnSaleOfCryptocurrencies"
          isReadOnly={isPresentationMode}
          isValid={warnings?.realisedGainsOnSaleOfCryptocurrencies}
        />
      </Grid>
      <Grid size={12}>
        <FieldNumeric label={t({ id: 'stakingRewardsIncome' })} name="stakingRewardsIncome" isReadOnly={isPresentationMode} isValid={warnings?.stakingRewardsIncome} />
      </Grid>
      <Grid size={12}>
        <FieldNumeric label={t({ id: 'netIncomeOptionSales' })} name="netIncomeOptionsSale" isReadOnly={isPresentationMode} isValid={warnings?.netIncomeOptionsSale} />
      </Grid>
      <Grid size={12}>
        <FieldNumeric label={t({ id: 'financialExpenses' })} name="financialExpenses" isReadOnly={isPresentationMode} isValid={warnings?.financialExpenses} />
      </Grid>
      <Grid size={12}>
        <FieldNumeric label={t({ id: 'extraordinaryExpenses' })} name="extraordinaryExpenses" isReadOnly={isPresentationMode} isValid={warnings?.extraordinaryExpenses} />
      </Grid>
      <Grid size={12}>
        <Total label={t({ id: 'profitBeforeTax' })} value={profitBeforeTax} />
      </Grid>
      <Grid size={12}>
        <FieldNumeric label={t({ id: 'directTaxes' })} name="directTaxes" isReadOnly={isPresentationMode} isValid={warnings?.directTaxes} />
      </Grid>
      <Grid size={12}>
        <Total label={t({ id: 'profitForTheYear' })} value={profitForTheYear} hasWarning={isCrossReportProfitEqual} />
      </Grid>
    </Grid>
  )
}
