import { Form } from 'formik'

import { FieldCheckbox, FieldCombobox, FieldText } from 'features/forms'
import { Grid } from 'features/mui/base'
import { useMediaQueries } from 'hooks'
import { useTranslations } from 'libs/translations/hooks/useTranslations'
import { SearchIconStyled } from 'modules/public-reports/components/ReportsToolbar/ReportsToolbar.styles'

import type { ReportsFiltersProps } from './ReportsFilters.types'

export const ReportsFilters = ({ options }: ReportsFiltersProps) => {
  const { t } = useTranslations()
  const { isTablet } = useMediaQueries()

  const { periodOptions, reportOptions, standardOptions } = options

  return (
    <Form id="public-reports-filters" noValidate>
      <Grid container flexDirection="column" size="grow" spacing={4} width="100%">
        <Grid size={12}>
          <FieldCombobox label={t({ id: 'report' })} name="report" options={reportOptions} multiple />
        </Grid>
        <Grid size={12}>
          <FieldCombobox label={t({ id: 'period' })} name="period" options={periodOptions} multiple />
        </Grid>
        <Grid size={12}>
          <FieldCombobox label={t({ id: 'standard' })} name="standard" options={standardOptions} multiple />
        </Grid>
        <Grid size={12}>
          <FieldCheckbox label={t({ id: 'attestedOnly' })} name="attestedOnly" />
        </Grid>
        {isTablet && (
          <Grid size={12}>
            <FieldText
              name="search"
              slotProps={{ input: { startAdornment: <SearchIconStyled /> }, htmlInput: { 'aria-label': t({ id: 'search' }) } }}
              placeholder={t({ id: 'publicReportsSearchPlaceholder' })}
              type="text"
            />
          </Grid>
        )}
      </Grid>
    </Form>
  )
}
