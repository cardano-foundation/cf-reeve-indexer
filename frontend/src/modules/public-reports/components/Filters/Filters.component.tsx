import Grid from '@mui/material/Grid'

import { ReportType } from 'libs/api-connectors/backend-connector-reeve/api/reports/publicReportsApi.types'
import { FieldPeriod } from 'libs/form-kit/components/FieldPeriod/FieldPeriod.component'
import { FieldReport } from 'libs/form-kit/components/FieldReport/FieldReport.component'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonText } from 'libs/ui-kit/components/ButtonText/ButtonText.component.tsx'
import { getReportPeriodOptions, getReportTypeOptions } from 'modules/public-reports/components/ReportParametersForm/ReportParametersForm.utils.ts'
import { FormStyled } from 'modules/public-reports/components/Filters/Filters.styles.tsx'

interface FiltersLayoutProps {
  areFiltersSelected: boolean
}

const FiltersLayout = ({ areFiltersSelected }: FiltersLayoutProps) => {
  const { t } = useTranslations()

  const reportPeriodOptions = getReportPeriodOptions()
  const reportTypeOptions = getReportTypeOptions([ReportType.BALANCE_SHEET, ReportType.INCOME_STATEMENT])

  return (
    <FormStyled>
      <Grid container size="grow" spacing={{ xs: 2, sm: 3 }}>
        <Grid size={{ xs: 'auto', sm: 'grow' }} maxWidth={{ xs: '100%', sm: '14.5rem' }} minWidth="10.5rem" width={{ xs: '100%', md: 'auto' }}>
          <FieldReport items={reportTypeOptions} />
        </Grid>
        <Grid size={{ xs: 'auto', sm: 'grow' }} maxWidth={{ xs: '100%', sm: '14.5rem' }} minWidth="10.5rem" width={{ xs: '100%', md: 'auto' }}>
          <FieldPeriod items={reportPeriodOptions} />
        </Grid>
        <Grid size={{ xs: 'grow', sm: 'auto' }}>
          <ButtonText type="reset" disabled={!areFiltersSelected} fullWidth>
            {t({ id: 'clearFilters' })}
          </ButtonText>
        </Grid>
      </Grid>
    </FormStyled>
  )
}

interface FiltersProps {
  areFiltersSelected: boolean
}

export const Filters = ({ areFiltersSelected }: FiltersProps) => {
  return <FiltersLayout areFiltersSelected={areFiltersSelected} />
}
