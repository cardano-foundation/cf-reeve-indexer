import { Form } from 'formik'

import { FieldCombobox } from 'features/forms'
import { Grid } from 'features/mui/base'
import { useTranslations } from 'libs/translations/hooks/useTranslations'

import type { ReportsFiltersProps } from './ReportsFilters.types'

export const ReportsFilters = ({ options }: ReportsFiltersProps) => {
  const { t } = useTranslations()

  const { periodOptions, reportOptions } = options

  return (
    <Form id="public-reports-filters" noValidate>
      <Grid container flexDirection="column" size="grow" spacing={4} width="100%">
        <Grid size={12}>
          <FieldCombobox label={t({ id: 'report' })} name="report" options={reportOptions} multiple />
        </Grid>
        <Grid size={12}>
          <FieldCombobox label={t({ id: 'period' })} name="period" options={periodOptions} multiple />
        </Grid>
      </Grid>
    </Form>
  )
}
