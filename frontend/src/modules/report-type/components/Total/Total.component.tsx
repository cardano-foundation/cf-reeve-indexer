import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import { formatNumber } from 'libs/utils/format.ts'

interface TotalProps {
  label: string
  value: number
  hasError?: boolean
  hasWarning?: boolean
}

export const Total = ({ label, value, hasError, hasWarning }: TotalProps) => {
  const color = hasError ? 'error.dark' : hasWarning ? 'warning.dark' : 'text.primary'

  return (
    <Grid alignItems="center" container size="grow" spacing={{ xs: 1, sm: 3 }}>
      <Grid container size={{ xs: 12, sm: 'grow' }}>
        <Typography component="span" variant="h3">
          {label}
        </Typography>
      </Grid>
      <Grid display="flex" justifyContent="flex-end" maxWidth={{ xs: '100%', sm: '14.5rem' }} size="grow">
        <Typography color={color} component="span" variant="h3" pr={1.75}>
          {formatNumber(value)}
        </Typography>
      </Grid>
    </Grid>
  )
}
