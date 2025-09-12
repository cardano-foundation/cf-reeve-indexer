import Grid from '@mui/material/Grid'

import { ChartTransactionsReconciled } from 'modules/reconciliation/components/ChartTransactionsReconciled/ChartTransactionsReconciled.component.tsx'
import { ChartTransactionsUnreconciled } from 'modules/reconciliation/components/ChartTransactionsUnreconciled/ChartTransactionsUnreconciled.component.tsx'

interface SectionDashboardProps {
  hasBeenReconciled: boolean
}

export const SectionDashboard = ({ hasBeenReconciled }: SectionDashboardProps) => {
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 'grow' }}>{hasBeenReconciled && <ChartTransactionsReconciled />}</Grid>
      <Grid size={{ xs: 12, md: 'grow' }}>{hasBeenReconciled && <ChartTransactionsUnreconciled hasBeenReconciled={hasBeenReconciled} />}</Grid>
    </Grid>
  )
}
