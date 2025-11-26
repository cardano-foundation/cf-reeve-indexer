import { Form } from 'formik'

import { FieldCombobox, FieldDateCombobox, FieldNumeric } from 'features/forms'
import { Grid, Divider, Typography } from 'features/mui/base'
import { useTranslations } from 'libs/translations/hooks/useTranslations'

import { useSearchFilters } from './SearchFilters.hooks'

export const SearchFilters = () => {
  const { t } = useTranslations()

  const { values, dateFromMaxDate, dateFromMinDate, dateToMaxDate, dateToMinDate, options } = useSearchFilters()

  const {
    costCenterOptions,
    counterpartyOptions,
    counterpartyTypeOptions,
    currencyOptions,
    documentNumberOptions,
    eventOptions,
    projectOptions,
    transactionNumberOptions,
    transactionTypeOptions,
    vatCodeOptions
  } = options

  return (
    <Form id="public-transactions-filters" noValidate>
      <Grid container flexDirection="column" size="grow" spacing={4} width="100%">
        <Grid container size="grow" columnSpacing={2} rowSpacing={3}>
          <Typography variant="h3">{t({ id: 'transactionDetails' })}</Typography>
          <Grid size={12}>
            <FieldDateCombobox label={t({ id: 'from' })} name="dateFrom" minDate={dateFromMinDate} maxDate={values.dateTo || dateFromMaxDate} />
          </Grid>
          <Grid size={12}>
            <FieldDateCombobox label={t({ id: 'to' })} name="dateTo" minDate={values.dateFrom || dateToMinDate} maxDate={dateToMaxDate} />
          </Grid>
          <Grid size={12}>
            <FieldCombobox label={t({ id: 'transactionNumber' })} name="transactionNumber" options={transactionNumberOptions} multiple />
          </Grid>
          <Grid size={12}>
            <FieldCombobox label={t({ id: 'transactionType' })} name="transactionType" options={transactionTypeOptions} multiple />
          </Grid>
        </Grid>
        <Divider flexItem orientation="horizontal" />
        <Grid container size="grow" columnSpacing={2} rowSpacing={3}>
          <Typography variant="h3">{t({ id: 'transactionItems' })}</Typography>
          <Grid size={12}>
            <FieldCombobox label={t({ id: 'documentNumber' })} name="documentNumber" options={documentNumberOptions} multiple />
          </Grid>
          <Grid size={12}>
            <FieldCombobox label={t({ id: 'currency' })} name="currency" options={currencyOptions} multiple />
          </Grid>
          <Grid size={6}>
            <FieldNumeric label={t({ id: 'minAmount' })} name="minAmount" />
          </Grid>
          <Grid size={6}>
            <FieldNumeric label={t({ id: 'maxAmount' })} name="maxAmount" />
          </Grid>
          <Grid size={12}>
            <FieldCombobox label={t({ id: 'vatCode' })} name="vatCode" options={vatCodeOptions} multiple />
          </Grid>
          <Grid size={12}>
            <FieldCombobox label={t({ id: 'costCenter' })} name="costCenter" options={costCenterOptions} multiple />
          </Grid>
          <Grid size={12}>
            <FieldCombobox label={t({ id: 'projectCode' })} name="project" options={projectOptions} multiple />
          </Grid>
          <Grid size={12}>
            <FieldCombobox label={t({ id: 'counterparty' })} name="counterparty" options={counterpartyOptions} multiple />
          </Grid>
          <Grid size={12}>
            <FieldCombobox label={t({ id: 'counterpartyType' })} name="counterpartyType" options={counterpartyTypeOptions} multiple />
          </Grid>
          <Grid size={12}>
            <FieldCombobox label={t({ id: 'event' })} name="event" options={eventOptions} multiple />
          </Grid>
        </Grid>
      </Grid>
    </Form>
  )
}
