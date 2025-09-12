import Grid from '@mui/material/Grid'
import { Form } from 'formik'

import { FieldPeriod } from 'libs/form-kit/components/FieldPeriod/FieldPeriod.component.tsx'
import { getReportPeriodOptions } from 'libs/ui-kit/components/DashboardFilters/DashboardFilters.utils.ts'

interface DashboardFiltersLayoutProps {
  isPeriodDisabled?: boolean
}

const DashboardFiltersLayout = ({ isPeriodDisabled }: DashboardFiltersLayoutProps) => {
  const periodOptions = getReportPeriodOptions()

  return (
    <Form>
      <Grid container spacing={3}>
        <Grid width="14.5rem">
          <FieldPeriod items={periodOptions} disabled={isPeriodDisabled} />
        </Grid>
      </Grid>
    </Form>
  )
}

interface DashboardFiltersProps {
  isPeriodDisabled?: boolean
}

export const DashboardFilters = ({ isPeriodDisabled }: DashboardFiltersProps) => {
  return <DashboardFiltersLayout isPeriodDisabled={isPeriodDisabled} />
}
