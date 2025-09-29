import { Form } from 'formik'

import { FieldCombobox, FieldDateCombobox, FieldNumeric } from 'features/forms'
import { Grid, Divider, Typography } from 'features/mui/base'
import { useTranslations } from 'libs/translations/hooks/useTranslations'
import { useBatchDetailsFilterOptions } from 'modules/review/hooks/useBatchDetailsFilterOptions.ts'

export const BatchDetailsFilters = () => {
  const { t } = useTranslations()

  const {
    accountsOptions,
    costCenterParentsOptions,
    costCenterChildrenOptions,
    counterPartyOptions,
    counterPartyTypeOptions,
    currenciesOptions,
    documentNumbersOptions,
    eventsOptions,
    projectParentsOptions,
    projectChildrenOptions,
    transactionTypeOptions,
    vatCodesOptions
  } = useBatchDetailsFilterOptions()

  return (
    <Form id="batch-details-filters">
      <Grid container flexDirection="column" size="grow" spacing={4} width="100%">
        <Grid container size="grow" columnSpacing={2} rowSpacing={3}>
          <Typography variant="h3">{t({ id: 'transactionDetails' })}</Typography>
          <Grid size={12}>
            <FieldDateCombobox label={t({ id: 'from' })} name="dateFrom" />
          </Grid>
          <Grid size={12}>
            <FieldDateCombobox label={t({ id: 'to' })} name="dateTo" />
          </Grid>
          <Grid size={12}>
            <FieldCombobox label={t({ id: 'transactionType' })} name="transactionType" options={transactionTypeOptions} />
          </Grid>
          <Grid size={6}>
            <FieldNumeric label={t({ id: 'minTotalAmountLCY' })} name="minTotalAmountLCY" />
          </Grid>
          <Grid size={6}>
            <FieldNumeric label={t({ id: 'maxTotalAmountLCY' })} name="maxTotalAmountLCY" />
          </Grid>
        </Grid>
        <Divider flexItem orientation="horizontal" />
        <Grid container size="grow" columnSpacing={2} rowSpacing={3}>
          <Typography variant="h3">{t({ id: 'transactionItems' })}</Typography>
          <Grid size={12}>
            <FieldCombobox label={t({ id: 'documentNumbers' })} name="documentNumbers" options={documentNumbersOptions} />
          </Grid>
          <Grid size={12}>
            <FieldCombobox label={t({ id: 'currency' })} name="currency" options={currenciesOptions} />
          </Grid>
          <Grid size={6}>
            <FieldNumeric label={t({ id: 'minAmountFCY' })} name="minAmountFCY" />
          </Grid>
          <Grid size={6}>
            <FieldNumeric label={t({ id: 'maxAmountFCY' })} name="maxAmountFCY" />
          </Grid>
          <Grid size={6}>
            <FieldNumeric label={t({ id: 'minAmountLCY' })} name="minAmountLCY" />
          </Grid>
          <Grid size={6}>
            <FieldNumeric label={t({ id: 'maxAmountLCY' })} name="maxAmountLCY" />
          </Grid>
          <Grid size={12}>
            <FieldCombobox label={t({ id: 'vatCode' })} name="vatCode" options={vatCodesOptions} />
          </Grid>
          <Grid size={12}>
            <FieldCombobox label={t({ id: 'costCenterParent' })} name="costCenterParent" options={costCenterParentsOptions} />
          </Grid>
          <Grid size={12}>
            <FieldCombobox label={t({ id: 'costCenterChild' })} name="costCenterChild" options={costCenterChildrenOptions} />
          </Grid>
          <Grid size={12}>
            <FieldCombobox label={t({ id: 'projectCodeParent' })} name="projectParent" options={projectParentsOptions} />
          </Grid>
          <Grid size={12}>
            <FieldCombobox label={t({ id: 'projectCodeChild' })} name="projectChild" options={projectChildrenOptions} />
          </Grid>
          <Grid size={12}>
            <FieldCombobox label={t({ id: 'counterparty' })} name="counterparty" options={counterPartyOptions} />
          </Grid>
          <Grid size={12}>
            <FieldCombobox label={t({ id: 'counterpartyType' })} name="counterpartyType" options={counterPartyTypeOptions} />
          </Grid>
          <Grid size={12}>
            <FieldCombobox label={t({ id: 'accountDebit' })} name="accountDebit" options={accountsOptions} />
          </Grid>
          <Grid size={12}>
            <FieldCombobox label={t({ id: 'accountCredit' })} name="accountCredit" options={accountsOptions} />
          </Grid>
          <Grid size={12}>
            <FieldCombobox label={t({ id: 'event' })} name="event" options={eventsOptions} />
          </Grid>
        </Grid>
      </Grid>
    </Form>
  )
}
