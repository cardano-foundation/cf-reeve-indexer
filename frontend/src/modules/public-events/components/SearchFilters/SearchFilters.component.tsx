import { Form } from 'formik'

import { FieldCombobox, FieldDateCombobox, FieldNumeric } from 'features/forms'
import { Grid, Divider, Typography } from 'features/mui/base'
import { useTranslations } from 'libs/translations/hooks/useTranslations'

import { useSearchFilters } from './SearchFilters.hooks'

export const SearchFilters = () => {
  const { t } = useTranslations()

  const { values, dateFromMaxDate, dateFromMinDate, dateToMaxDate, dateToMinDate, options } = useSearchFilters()

  const { eventTypeOptions, projectOptions } = options

  return (
    <Form id="public-events-filters" noValidate>
      <Grid container flexDirection="column" size="grow" spacing={4} width="100%">
        <Grid container size="grow" columnSpacing={2} rowSpacing={3}>
          <Typography variant="h3">{t({ id: 'eventDetails' })}</Typography>
          <Grid size={12}>
            <FieldDateCombobox label={t({ id: 'from' })} name="dateFrom" minDate={dateFromMinDate} maxDate={values.dateTo || dateFromMaxDate} />
          </Grid>
          <Grid size={12}>
            <FieldDateCombobox label={t({ id: 'to' })} name="dateTo" minDate={values.dateFrom || dateToMinDate} maxDate={dateToMaxDate} />
          </Grid>
          <Grid size={12}>
            <FieldCombobox label={t({ id: 'eventType' })} name="eventType" options={eventTypeOptions} multiple />
          </Grid>
          <Grid size={12}>
            <FieldCombobox label={t({ id: 'project' })} name="project" options={projectOptions} multiple />
          </Grid>
        </Grid>
        <Divider flexItem orientation="horizontal" />
        <Grid container size="grow" columnSpacing={2} rowSpacing={3}>
          <Typography variant="h3">{t({ id: 'amount' })}</Typography>
          <Grid size={6}>
            <FieldNumeric label={t({ id: 'minAmount' })} name="minAmount" />
          </Grid>
          <Grid size={6}>
            <FieldNumeric label={t({ id: 'maxAmount' })} name="maxAmount" />
          </Grid>
        </Grid>
      </Grid>
    </Form>
  )
}
